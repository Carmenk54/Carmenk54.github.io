let tags = {};
let fetchedTodos = [];

function logout() {
    removeCredentials();
    window.location.href = LOGIN_PAGE;
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
