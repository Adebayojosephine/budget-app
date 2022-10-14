
//This is a module, It's an immediately invoked function expression(IIFE) that returns an object
//We're using an IIFE here because it allows data privacy, so our scope can not be accessed by an outside scope
//Budget Controller - controls the budget
let budgetController = (function() {
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
    }

    return{
        addItem: function(type, des, val) {
            var newItem, ID;

            //Create new ID 
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            //Create new item based on inc or exp type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val)
            }

            //Push it into ur data structure
            data.allItems[type].push(newItem);

            //Return the new element 
            return newItem;
        },
        testing: function() {
            console.group(data);
        }
    };
})();


//User Interface Controller - controls the whole user interface
let UIController = (function() {
    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list'
    }

    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //Will either be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: document.querySelector(DOMstrings.inputValue).value
            }
        },
        addListItem: function(obj, type) {
            let html, newHtml, element;
            //1. Create HTML string with placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if(type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            //2. Replace the placeholder test with actual data, i.e. data received from the object
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value)

            //3. Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        getDOMstrings: function() {
            return DOMstrings
        }
    };
})();



//controller that will help the budgetController and the UIController to communicate, as they are both independent modules
//Global App Controller
let controller = (function(budgetCtrl, UICtrl) {

    let setupEventListeners = function() {
        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if(event.key === 'Enter' || event.key === 'NumpadEnter') {
                ctrlAddItem()
            }
        })
    };

    let ctrlAddItem = function() {
        let input, newItem;
        //1. Get the field input data
        input = UICtrl.getinput();

        //2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        //3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        //4. Calculate the budget

        //5. Display the budget on the UI
        
    };
   
    return {
        init: function() {
            console.log('Application has started');
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();