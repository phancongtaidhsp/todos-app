
class Model {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    this.statusDisplay = localStorage.getItem('status') || 'all';
  }

  bindchangeDisplay(callback,status){
    this.statusDisplay=status;
    localStorage.setItem('status', this.statusDisplay);
    this.onTodoListChanged = callback;
    this.onTodoListChanged(this.statusDisplay,this.todos);
  }

  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback;
  }

  _commit(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
    this.onTodoListChanged(this.statusDisplay,todos);
  }

  addTodo(todoText) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      text: todoText,
      complete: false,
    }

    this.todos.push(todo);
    this._commit(this.todos);
  }

  editTodo(id, updatedText) {
    
    this.todos = this.todos.map(todo =>
      todo.id === id ? { id: todo.id, text: updatedText, complete: todo.complete } : todo
    )
    this._commit(this.todos);
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this._commit(this.todos);
  }

  deleteCompleteds(){
    this.todos = this.todos.filter(todo => !todo.complete);
    this._commit(this.todos);
  }

  toggleTodo(id) {
    this.todos = this.todos.map(todo =>
      todo.id === id ? { id: todo.id, text: todo.text, complete: !todo.complete } : todo
    )
    this._commit(this.todos);
  }

  fastSelect(){
    let completedTodos=true;
    for (const todo of this.todos) {
      if(!todo.complete){
        this.todos=this.todos.map(todo => {
          return { id: todo.id, text: todo.text, complete: true }
        })
        completedTodos=false;
        break;
      }
    }
    if(completedTodos) this.todos=this.todos.map(todo => {
      return { id: todo.id, text: todo.text, complete: false }
    })
    this.onTodoListChanged(this.statusDisplay,this.todos);
  }

}

class View {
  constructor() {
    this.app = document.querySelector('.form-app');
    this.fastSelect = document.querySelector('.label-select')
    this.input = document.querySelector('.user-input');
    this.bodyApp = this.createElement('div','body-app');
    this.todoList = this.createElement('ul','list-data');
    this.footer = this.createElement('footer','footer');
    this.bodyApp.appendChild(this.todoList);
    this.bodyApp.appendChild(this.footer);
    this.count = this.createElement('p','count-item');
    this.footer.appendChild(this.count);
    const bodyFooter=`<nav class="filter">
    <a class="link-change-display" href="#" data-name="all">All</a>
    <a class="link-change-display" href="#" data-name="active">Active</a>
    <a class="link-change-display" href="#" data-name="completed">Completed</a>
    </nav>
    <button class="btn-clear-completed">Clear completed</button>`;
    this.footer.innerHTML+=bodyFooter;
    this.app.appendChild(this.bodyApp);
    this.btnClearCompleted = document.querySelector('.btn-clear-completed');
  }

  get _todoText() {
    return this.input.value;
  }

  _resetInput() {
    this.input.value = '';
  }

  createElement(tag, className) {
    const element = document.createElement(tag);

    if (className) element.classList.add(className);

    return element;
  }

  getElement(selector) {
    const element = document.querySelector(selector);

    return element;
  }

  displayAllTodos(status,todos,fullTodos = todos) {
    // Delete all nodes
    this.todoList.innerHTML='';
    let isCompletedsTodos = true;
    if(todos.length > 0) {
      this.bodyApp.appendChild(this.todoList);
      this.bodyApp.appendChild(this.footer);
      // Create nodes
      todos.forEach(todo => {
        if(!todo.complete) isCompletedsTodos=false;
        let li = this.createElement('li','item');
        li.dataset.id = todo.id;

        let round = this.createElement('div','round');
        let lableCheckbox = this.createElement('label');
        lableCheckbox.className='round-label';
        lableCheckbox.setAttribute("for", todo.id);
        lableCheckbox.checked=todo.complete;
        let checkbox = this.createElement('input','round-input');
        checkbox.id = todo.id;
        checkbox.type = 'checkbox';
        checkbox.checked = todo.complete;
        round.appendChild(checkbox);
        round.appendChild(lableCheckbox);
        let classCompleted = todo.complete ? ' completed' : '';
        let data = `<div class="item__input${classCompleted}">${todo.text}</div>
        <button type="button" class="close" aria-label="Close">
            <i class="delete fas fa-times"></i>
        </button>`;
        li.innerHTML+=data;
        li.prepend(round);
        this.todoList.append(li);
      })
      this._addEventEditInput();
    }
    else if(fullTodos.length > 0 && todos.length <= 0){
      this.todoList.innerHTML='';
    } 
    else{
      this.bodyApp.innerHTML='';
    }
    if(fullTodos.length>0){
      //counter itemsLeft
      let itemsLeft=0;
      for (const todo of fullTodos) {
        itemsLeft= !todo.complete ? itemsLeft+1 : itemsLeft;
      }
      document.querySelector('.count-item').innerHTML=`${itemsLeft} items left`;
      if(fullTodos.length - itemsLeft > 0 ){
        this.btnClearCompleted.style.visibility="visible";
      }
      else this.btnClearCompleted.style.visibility="hidden";
    }
    let childrenFooter = [...this.footer.children];
    for (const el of childrenFooter) {
      if(el.className.includes('filter')){
        let children = [...el.children];
        children.map(child => {
          child.className=child.className.replace('pink-border','');
          if(child.dataset.name === status) child.className+=' pink-border';
        })
      }
    }
    if(isCompletedsTodos)
      this.fastSelect.className=this.fastSelect.className.replace(' blur-icon','');
    else if(!this.fastSelect.className.includes('blur-icon')) this.fastSelect.className+=' blur-icon';
  }

  _addEventEditInput(){
    var arr=[...this.todoList.children];
    for (const i of arr) {
      i.children[1].addEventListener('dblclick', event => {
        if (event.target.className.includes('item__input')) {
          event.target.contentEditable=true;
          event.target.focus();
          if(!event.target.className.includes('item__input-selected edit-input'))
            event.target.className+=' item__input-selected edit-input';
          var parent = event.target.parentElement;
          if(!parent.children[0].className.includes('hidden'))
            parent.children[0].className+=' hidden';
          if(!parent.children[2].className.includes('display-none'))
            parent.children[2].className+=' display-none';
        }
      })
    }
  }

  bindAddTodo(handler) {
    this.input.addEventListener('keydown', event => {
      if(event.keyCode === 13){
        if (this._todoText) {
          handler(this._todoText);
          this._resetInput();
          event.preventDefault();
        }
      }
    })
  }

  bindDeleteTodo(handler) {
    this.todoList.addEventListener('click', event => {
      if (event.target.className.includes('delete')) {
          const id = parseInt(event.target.parentElement.parentElement.dataset.id)
          handler(id);
      }
    })
  }

  bindEditTodo(handler) {
    this.todoList.addEventListener('focusout', event => {
      if(event.target.className.includes('item__input')){
        var id = parseInt(event.target.parentElement.dataset.id);
        event.target.className='item__input';
        handler(id,event.target.innerHTML);
      }
    })
    this.todoList.addEventListener('keydown',event => {
      if(event.target.className.includes('item__input')){
        if(event.keyCode === 13){
          var id = parseInt(event.target.parentElement.dataset.id);
          event.target.className='item__input';
          handler(id,event.target.innerHTML);
        }
      }
    })
  }

  bindToggleTodo(handler) {
    this.todoList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = parseInt(event.target.id)
        handler(id)
      }
    })
  }

  initEventChangeDisplayFooter(handle){
    this.footer.addEventListener('click', event => {
      if(event.target.dataset.name === 'active'){
        handle(this.bindThisDisPlayActives,'active');
      }
      else if(event.target.dataset.name === 'completed'){
        handle(this.bindThisDisplayCompleted,'completed');
      }
      else if(event.target.dataset.name === 'all'){
        handle(this.bindThisDisPlayAll,'all');
      }
    })
  }

  bindDeleteCompleteds = (handle) => {
    this.footer.lastChild.addEventListener('click', event => {
      if (event.target.className.includes('btn-clear-completed')) {
        handle();
      }
    })
  }

  bindThisDisPlayActives = (status,todos) => {
    this.displayActives(status,todos);
  }

  bindThisDisplayCompleted = (status,todos) => {
    this.displayCompleteds(status,todos);
  }
  bindThisDisPlayAll = (status,todos) => {
    this.displayAllTodos(status,todos);
  }

  displayActives(status,todos){
    var fullTodos=todos;
    todos = todos.filter(todo => {
      return !todo.complete;
    })
    this.displayAllTodos(status,todos,fullTodos);
  }

  displayCompleteds(status,todos){
    var fullTodos=todos;
    todos = todos.filter(todo => {
      return todo.complete;
    })
    this.displayAllTodos(status,todos,fullTodos);
  }

  bindFastSelect(handle){
    this.fastSelect.addEventListener('click', event => {
      handle();
    })
  }

}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    // Display initial todos
    this.initDisplay(this.model.statusDisplay,this.model.todos);

    // Explicit this binding
    this.model.bindTodoListChanged(this.initDisplay);
    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindEditTodo(this.handleEditTodo);
    this.view.bindDeleteTodo(this.handleDeleteTodo);
    this.view.bindToggleTodo(this.handleToggleTodo);
    this.view.initEventChangeDisplayFooter(this.changeDisplay);
    this.view.bindDeleteCompleteds(this.handleDeleteCompleteds);
    this.view.bindFastSelect(this.handleFastSelect);
  }

  initDisplay = (status,todos) => {
    if(status === 'active')
      this.view.bindThisDisPlayActives(status,todos);
    else if(status=== 'completed')
      this.view.bindThisDisplayCompleted(status,todos);
    else this.view.displayAllTodos(status,todos);
  }

  handleAddTodo = todoText => {
    this.model.addTodo(todoText);
  }

  handleEditTodo = (id, todoText) => {
    this.model.editTodo(id, todoText);
  }

  handleDeleteTodo = id => {
    this.model.deleteTodo(id);
  }

  handleToggleTodo = id => {
    this.model.toggleTodo(id);
  }

  changeDisplay = (callback,status) => {
    this.model.bindchangeDisplay(callback,status);
  }

  handleDeleteCompleteds = () => {
    this.model.deleteCompleteds();
  }

  handleFastSelect = () => {
    this.model.fastSelect();
  }
}

const app = new Controller(new Model(), new View())
