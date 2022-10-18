
//This is a module, It's an immediately invoked function expression(IIFE) that returns an object
//We're using an IIFE here because it allows data privacy, so our scope can not be accessed by an outside scope
//Budget Controller - controls the budget
let budgetController = (function() {
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value
        })
        data.totals[type] = sum;
    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 //that's non-existent
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

        deleteItem: function(type, id) {
            let ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget: function() {
            //1. calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //2.  calculate the budget - income-expenses
            data.budget = data.totals.inc - data.totals.exp;

            //3. calculate the % of income spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc)
            })
        },

        getPercentages: function() {
            let allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
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
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    let formatNumber = function(num, type) {
        let numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
        }

        dec = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+';

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec
    };

    let nodeListForEach = function(list, callback) {
        for(let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //Will either be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        addListItem: function(obj, type) {
            let html, newHtml, element;
            //1. Create HTML string with placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if(type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            //2. Replace the placeholder test with actual data, i.e. data received from the object
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))

            //3. Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        //add a new method to delete items
        deleteListItem: function(selectorID) {
            let el =  document.getElementById(selectorID);
            el.parentNode.removeChild(el)
        },

        //add a new method to clear fields
        clearFields: function() {
            let fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            //storing it in an array
            fieldsArr = Array.prototype.slice.call(fields)

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            //set the focus back to add description
            fieldsArr[0].focus();
        },

        //add a new method to display the budget
        displayBudget: function(obj) {
            let type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type) ;
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '----';
            }
        },

        displayPercentages: function(percentages) {
            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '----';
                }
            });
        },

        displayMonth: function() {
            let now, months,  month, year;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            )

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus')
            })

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
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
        
        //change the color from blue to red when we change type from income to expense
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

        document.addEventListener('keypress', function(event) {
            if(event.key === 'Enter' || event.key === 'NumpadEnter') {
                ctrlAddItem()
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    let updateBudget = function() {

        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the budget
        let budget = budgetCtrl.getBudget();
        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    let updatePercentages = function() {
        //1. Calculate percentages
        budgetCtrl.calculatePercentages();
        //2. Read them from the budget controller
        let percentages = budgetCtrl.getPercentages();
        //3. Update the UI with the new percentages
        UIController.displayPercentages(percentages);
    }

    let ctrlAddItem = function() {
        let input, newItem;
        //1. Get the field input data
        input = UICtrl.getinput();

        //only update if it is a number
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();

            //6. Calculate and update the percentages
            updatePercentages();
        }
    };

    let ctrlDeleteItem = function(event) {
        let itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show new budget
            updateBudget();

            //4. Calculate and update the percentages
            updatePercentages();
        }
    }
   
    //On initialization, i.e, what happens immediately the site loads
    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();
