const DATE_FORMAT = "DD MMM YYYY";

function displayStatus(status) {
    let elmt = document.getElementById("status-display");
    elmt.innerText = status;
}

function displayTasks(tasks,taskElmtList) {
    let todoTable = document.getElementById(ID_TODO_TABLE);
    
    // Clear child nodes
    todoTable.innerHTML = '';

    let tableHtml = '';
    taskElmtList.map((taskElmt, i) => {
        tableHtml += `
            <tr>
                <td><input class="form-check-input" type="checkbox" value="" id="${tasks[i].id}"></td>
                <td>${taskElmt}</td>
            </tr>
        `;
    });

    todoTable.innerHTML = tableHtml;
}

function displayInElmtById(id, elmt) {
    let idElmt = document.getElementById(id);
    idElmt.innerHTML = elmt;
}

function getTaskElmt(task, tags) {
    if (task.type !== 'todo')
        return;

    let title = MarkdownToHtml.parse(task.text);

    let checklist = task.checklist;
    let checklistElmt = getChecklistElmt(checklist);

    let taskTags = getTaskTagElmt(task.tags, tags);
    let dueDateElmt = getDueDateElmt(task.date);

    return `
        <div>${title}</div>
        ${checklistElmt}
        <div class="task-extra">
            ${dueDateElmt}
            ${taskTags}
        </div>
    `;
}

function getDueDateElmt(dueDate) {
    if (! dueDate)
        return `<p class="due-date"></p>`;

    let today = moment();
    let momentDate = moment(dueDate);
    
    let diffYr = momentDate.diff(today, 'years');
    if (diffYr > 0)
        return `<p class="due-date">Due in ${diffYr} ${getPlural(diffYr, 'year')}</p>`;

    let diffMth = momentDate.diff(today, 'months');
    if (diffMth > 0)
        return `<p class="due-date">Due in ${diffMth} ${getPlural(diffYr, 'month')}</p>`;

    let diffDay = momentDate.diff(today, 'days');
    if (diffDay < -7) {
        return `<p class="due-date due-date-urgent">Dued on ${momentDate.format(DATE_FORMAT)}}</p>`;
    } else if (diffDay < 0) {
        let absDiff = Math.abs(diffDay);
        return `<p class="due-date due-date-urgent">Dued ${absDiff} ${getPlural(absDiff, 'day')} ago</p>`;
    } else if (diffDay == 0) {
        return `<p class="due-date due-date-urgent">Due Today</p>`;
    } else if (diffDay <= 7) {
        return `<p class="due-date due-date-warning">Due in ${diffDay} days</p>`;
    } else {
        return `<p class="due-date">Due in ${diffDay} days</p>`;
    }
}

function getPlural(amount, singular, plural) {
    if (! plural) {
        plural = singular + 's';
    }

    return amount === 1 ? singular : plural;
}

function getTaskTagElmt(taskTags, tags) {
    let tagElmts = '';

    taskTags.map(tag => {
        tagElmts += `<span>${tags[tag]}</span>`;
    });

    return `<p class="tag-list">${tagElmts}</p>`;
}

function getChecklistElmt(checklist) {
    if (checklist.length < 1)
        return '';
    
    let listElmts = '';
    checklist.map(todo => {
        listElmts += `<li ${todo.completed ? 'class="todo-done"' : ''}>${todo.text}</li>`;
    });

    return `
        <ul class="checklist">
            ${MarkdownToHtml.parse(listElmts)}
        </ul>
    `;
}

function getDueDateTableElmt(dueDateTable) {
    if (! dueDateTable instanceof Object)
        return "";
    
    let dueDateTableInnerHtml = '';
    for (let dueDate in dueDateTable) {
        let todos = dueDateTable[dueDate];
        
        let todosHtml = '';
        todos.forEach(todo => {
            todosHtml += `<div>${MarkdownToHtml.parse(todo.text)}</div>`;
        });

        dueDateTableInnerHtml += `
            <tr>
                <td>${dueDate}</td>
                <td>${todosHtml}</td>
            </tr>
        `;
    }

    return `
        <table class="table">
            <thead>
                <tr>
                    <th scope="col">Due Date</th>
                    <th scope="col">Todo</th>
                </tr>
            </thead>
            <tbody>
                ${dueDateTableInnerHtml}
            </tbody>
        </table>
        <div>
            <input class="form-control" type="date" placeholder="New Due Date" id="new-due-date">
        </div>
    `;
}

function getTagTableElmt(commonTags=[], tags={}) {
    let tagTableHtml = '';

    for (let tag in tags) {
        let checked = commonTags.includes(tag) ? "checked" : "";

        tagTableHtml += `
            <tr>
                <td><input class="form-check-input" type="checkbox" value="" id="${tag}" ${checked}></td>
                <td>${tags[tag]}</td>
            </tr>
        `;
    }

    return `
        <table class="table">
            <tbody>
                ${tagTableHtml}
            </tbody>
        </table>
    `;
}

function getElmtValueById(id) {
    let elmt = document.getElementById(id);
    if (!elmt) {
        return undefined;
    }

    return elmt.value;
}

function getCheckboxChecked(id) {
    let elmt = document.getElementById(id);
    if (!elmt) {
        return undefined;
    }

    return elmt.checked;
}

function displayVersion() {
    let versionElmt = document.getElementById(ID_VERSION);
    versionElmt.innerText = VERSION;
}

displayVersion();