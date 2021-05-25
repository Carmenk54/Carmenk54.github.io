let tags = {};
let filterTag = [];
let fetchedTodos = [];

function logout() {
    removeCredentials();
    window.location.href = LOGIN_PAGE;
}

function pushSortedDueDateTasksToTop() {
    displayStatus("Sorting...")

    getAllTodos().then(function(resp) {    
        let todos = resp.data;
        let todosWithDate = todos.filter(todo => todo.date)
        
        mergeSort(todosWithDate, 0, todosWithDate.length)
    
        let tasks = todosWithDate.reverse();
        moveToTop(tasks)
            .then(function() {
                fetchTodos();
            });
    });
}

function fetchTodos() {    
    displayStatus("Fetching todos...");
    displayTasks([], []);
    
    getAllTodos().then(function(resp) {
        let todos = resp.data;
        fetchedTodos = [...todos];

        filterByTag();
        displayStatus(`Fetched ${todos.length} todos`);
    });
}

function updateDueDatesModalCtrl() {
    const NO_DUE_KEY = 'No due date';

    let checkedTodos = getAllCheckedTodos();
    if (checkedTodos.length < 1)
        return;
    
    let dueDateTable = {};
    checkedTodos.forEach(todo => {
        if (! todo.date) {
            if (dueDateTable[NO_DUE_KEY]) {
                dueDateTable[NO_DUE_KEY].push(todo);
            } else {
                dueDateTable[NO_DUE_KEY] = [todo];
            }

            return;
        }

        let dueDateKey = moment(todo.date).format(DATE_FORMAT);
        if (dueDateTable[dueDateKey]) {
            dueDateTable[dueDateKey].push(todo);
        } else {
            dueDateTable[dueDateKey] = [todo];
        }
    });

    let dueDateTableElmt =  getDueDateTableElmt(dueDateTable);
    displayInElmtById('updateDueDateBody', dueDateTableElmt);
}

function updateDueDates() {
    let checkedTodos = getAllCheckedTodos();
    let newDueDate = getElmtValueById("new-due-date");
    if (! newDueDate) {
        alert("Please provide new due date");
        displayStatus(`Failed to update`);
        return;
    }

    displayStatus(`Updating...`);
    let putReqList = checkedTodos.map((todo, i) => {
        let urlParts = `tasks/${todo.id}`;
        let body = { 'date': (new Date(newDueDate)).toISOString() };
        let options = {
            body: JSON.stringify(body),
        };

        return putRequest(urlParts, options)
    });

    Promise.all(putReqList)
        .then(function() {
            displayStatus(`Updated ${checkedTodos.length} todos`);
            fetchTodos();
        })
        .catch(e => {
            displayStatus(`Failed to update`);
            alert(e);
        });
}

function updateTagsModalCtrl() {
    let checkedTodos = getAllCheckedTodos();

    let commonTags = [];
    let tagCnts = {};
    checkedTodos.forEach(todo => {
        todo.tags.forEach(tag => {
            if (tagCnts[tag]) {
                tagCnts[tag] = tagCnts[tag] + 1;
            } else {
                tagCnts[tag] = 1;
            }
        })
    });

    for (let tag in tagCnts) {
        if (tagCnts[tag] === checkedTodos.length)
            commonTags.push(tag);
    }

    let tagTableElmt = getTagTableElmt(commonTags, tags);
    displayInElmtById(ID_UPDATE_TAG_BODY, tagTableElmt);
}

function updateTags() {
    let modalBody = document.getElementById(ID_UPDATE_TAG_BODY);
    let inputs = modalBody.getElementsByTagName('input');

    let checkedTags = getAllCheckedCheckboxId(inputs);
    let checkedTodos = getAllCheckedTodos();

    checkedTodos.forEach((todo, i) => {
        let toAdd = checkedTags.filter(tag => !todo.tags.includes(tag));
        let toDel = todo.tags.filter(tag => !checkedTags.includes(tag));

        let addPromList = toAdd.map(tag => {
            let urlParts = `tasks/${todo.id}/tags/${tag}`;
            return postRequest(urlParts);
        });

        let delPromList = toDel.map(tag => {
            let urlParts = `tasks/${todo.id}/tags/${tag}`;
            return deleteRequest(urlParts);
        });
        
        Promise.all(delPromList)
            .then(function() {

                Promise.all(addPromList)
                    .then(function() {
                        displayStatus(`Updated ${checkedTodos.length} todos`);
                        fetchTodos();
                    })
                    .catch(e => {
                        displayStatus(`Failed to add tag`);
                        alert(`Failed to add tag. ${e}`);
                    });

            })
            .catch(e => {
                displayStatus(`Failed to delete tag`);
                alert(`Failed to delete tag. ${e}`);
            });
    });
}

function getAllCheckedTodos() {
    let todoTable = document.getElementById(ID_TODO_TABLE);
    let inputs = todoTable.getElementsByTagName('input');
    
    let result = [];
    for (let input of inputs) {
        let isCheckbox = input.getAttribute("type") === 'checkbox';

        if (isCheckbox && input.checked) {
            let id = input.id;
            let checkedTodo = fetchedTodos.find(todo => todo.id == id);
            if (checkedTodo)
                result.push(checkedTodo);
        }
    }
    
    return result;
}

function getAllCheckedCheckboxId(inputs=[]) {
    let result = [];
    for (let input of inputs) {
        let isCheckbox = input.getAttribute("type") === 'checkbox';

        if (isCheckbox && input.checked) {
            result.push(input.id);
        }
    }
    
    return result;
}

function filterByTagModalCtrl() {
    let tagTableElmt = getTagTableElmt(filterTag, tags);
    displayInElmtById(ID_FILTER_BY_TAG_BODY, tagTableElmt);
}

function filterByTag() {
    let tagTable = document.getElementById(ID_FILTER_BY_TAG_BODY);
    let checkedTag = getAllCheckedCheckboxId(tagTable.getElementsByTagName('input'));
    filterTag = [...checkedTag];
    if (filterTag.length < 1) {
        let taskElmtList = fetchedTodos.map((todo) => getTaskElmt(todo, tags));
        displayTasks(fetchedTodos, taskElmtList);
        return;
    }

    let filtered = fetchedTodos.filter(todo => {
        for (let tag of checkedTag) {
            if (todo.tags.includes(tag))
                return true;
        }

        return false;
    });

    let taskElmtList = filtered.map((todo) => getTaskElmt(todo, tags));
    displayTasks(filtered, taskElmtList);
}

function clearTagFilter() {
    filterTag = [];
    filterByTagModalCtrl();
}

function checkTodos() {
    let checkedTodos = getAllCheckedTodos();

    let checkPromises = checkedTodos.map(todo => {
        let urlParts = `tasks/${todo.id}/score/up`;
        return postRequest(urlParts);
    });

    Promise.all(checkPromises)
        .then(function() {
            displayStatus(`Checked ${checkedTodos.length} todos`);
            fetchTodos();
        })
        .catch(e => {
            displayStatus(`Failed to check`);
            alert(e);
        });
}

function deleteTodos() {
    let checkedTodos = getAllCheckedTodos();
    
    let msg = `Are you sure to delete ${checkedTodos.length} todos?`;
    checkedTodos.forEach(todo => { msg += `\n  - ${todo.text}` });
    let confirmed = confirm(msg);
    if (!confirmed) {
        return;
    }

    console.log(checkedTodos.map(todo => todo.text));

    let delPromises = checkedTodos.map(todo => {
        let urlParts = `tasks/${todo.id}`;
        return deleteRequest(urlParts);
    });

    Promise.all(delPromises)
        .then(function() {
            displayStatus(`Deleted ${checkedTodos.length} todos`);
            fetchTodos();
        })
        .catch(e => {
            displayStatus(`Failed to delete`);
            alert(e);
        });
}

async function getAllTags() {
    let urlParts = "tags"

    let req = await getRequest(urlParts);
    let tagList = req.data;
    tagList.map(tag => {
        tags[tag.id] = tag.name;
    });

    return req.data;
}

async function getAllTodos() {
    let urlParts = "tasks/user?type=todos";
    
    try {
        let req = await getRequest(urlParts);
        return req;

    } catch (e) {
        displayStatus("Failed to get all todos! " + e);
    }
}

async function moveToTop(tasks) {
    let status = "Finished!";

    let cnt = 1;
    for (let task of tasks) {
        let urlParts = `tasks/${task.id}/move/to/0`;

        try {
            let req = await postRequest(urlParts);
            displayStatus(`Moved ${cnt++}/${tasks.length} tasks`);
            console.log(`Task "${task.text}" move to top status: ${req.success ? 'success' : 'error'}`);
        } catch (e) {
            displayStatus("Error! " + e);
            status = "Error! " + e;
        }
    }

    displayStatus(status);
}

// init
function init() {
    getAllTags()
        .then(fetchTodos);
}

init();
