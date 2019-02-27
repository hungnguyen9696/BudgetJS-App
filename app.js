var budgetController = (function() {
    
    var Expense = function(id, description, value, percentage) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) *100);
        }else{
            this.percentage = -1;
        }
        
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    //type la string nen phai o trong [ ]
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(element) {
            sum+= element.value;
        })
        data.totals[type]= sum;
    };
    
//    var allExpenses = [];
//    var allIncome = [];
//    var totalExpenses = 0;
    
    //data, allItems la obj, [] la array
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    //return all public method
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            
            //create new ID
            if(data.allItems[type].length >0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }else{
                ID = 0;
            }
            
            //create new item based on inc or exp type
            if(type=== 'exp') {
                newItem = new Expense(ID, des, val);
            }else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push it into our data structure
            data.allItems[type].push(newItem);
            
            //return the new item
            return newItem;
        },
        
        //array.map, loop den khi thay trung ID thi xoa
        deleteItem: function(type, ID) {
            var ids, index;
            
            ids = data.allItems[type].map(function(element) {
                return element.id;
                
            });
            
            index = ids.indexOf(ID);
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function() {
            //calculate total income and expenses
            //parameter la text
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate budget:
            //obj.property
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) *100);
            }else{
                data.percentage = -1;
            }
        },
        
        
        calculatePercentages: function() {
              data.allItems.exp.forEach(function(element) {
                  element.calcPercentage(data.totals.inc);
              })
        },
        
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(element) {
                return element.getPercentage();
            });
            return allPerc;
        },
        
        
        getBudget: function() {
          return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
          };
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
})();



var UIController = (function() {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        expensesPerclabel: '.item__percentage',
        dateLabel: '.budget__title--month',
        
        container: '.container'
    };
    
    return {
        //getInput la object
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
                
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            //create html string with placeholder text
            
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
                
            }else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
                        
            //replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            
            
            //insert real html into the DOM
            //beforeend la location
            //element la class
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        
        clearFields: function() {
            var fields, fieldsArray;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            //convert list to array
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(element) {
                element.value ='';
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            
            //.textcontent cung ok
            document.querySelector('.budget__value').innerHTML= obj.budget;
            document.querySelector('.budget__income--value').innerHTML= obj.totalInc;
            document.querySelector('.budget__expenses--value').innerHTML= obj.totalExp;
            
            if(obj.percentage >0) {
                document.querySelector('.budget__expenses--percentage').innerHTML= obj.percentage + '%';
            }else{
                document.querySelector('.budget__expenses--percentage').innerHTML= '---';
            }
        },
        
        
        //percentages la array
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPerclabel);
            
            var nodeListForEach = function(list, callback) {
                for(var i =0; i< list.length; i++) {
                    callback(list[i], i);
                }
            };
            
            nodeListForEach(fields, function(element, index) {
                if(percentages[index] > 0) {
                    element.textContent = percentages[index] + '%';
                }else{
                    element.textContent = '---';
                }
            });
        },
        
        
        displayMonth: function() {
            var now, month, year;
            
            now = new Date();
            
            //0-11 month
            month = now.getMonth() +1;
            year = now.getFullYear();
            
            document.querySelector(DOMstrings.dateLabel).textContent = month+ '/'+ year;
        },
        
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    
})();



var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        
        });
        
        //instead of adding eventlistener to all income and expense, we add it to the container, which is the common one
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };
    
    
    var updateBudget = function() {
        
        //1. calculate the budget
        budgetCtrl.calculateBudget();
        
        //2. return the budget
        var budget = budgetCtrl.getBudget();
        
        //3. display the budget on the UI => method on UI controller
        UICtrl.displayBudget(budget);
    };

    
    var updatePercentages = function() {
        
        //calculate percentage
        budgetCtrl.calculatePercentages();
        
        //read percentage from budget controller
        //return an array of percentages
        var percentages = budgetCtrl.getPercentages();
        
        //update ui with new percentage
        UICtrl.displayPercentages(percentages);
    };
    
    
    var ctrlAddItem = function() {
        var DOM = UICtrl.getDOMstrings();
        
        //1. get the field input data
        //read input and store in a variable
        var input = UICtrl.getInput();
        
        if(input.description !== '' && input.value > 0 && !isNaN(input.value)) {
        
            //2. add item into budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            //3.add item to UI
            UICtrl.addListItem(newItem, input.type);
        
            //4. clear the fields
            UICtrl.clearFields();
        }
        
        //5. calculate and update budget
        updateBudget();
        
        //6. update percentage
        updatePercentages();
          
    };
    
    var ctrlDeleteItem = function(event) {
        var splitID, type, ID;
        
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            //ID la string bcuz split from string => dung parseInt de convert thanh int
            ID = parseInt(splitID[1]);
        }
        
        //2. delete item from data structure
        budgetCtrl.deleteItem(type, ID);
        
        //3.delete item from UI
        UICtrl.deleteListItem(itemID);
        
        //4.update budget
        updateBudget();
        
        //5. update percentage
        updatePercentages();
    }
    
    return {
        init: function() {
            
            console.log('app started');
            setupEventListeners();
            
//            document.querySelector('.budget__value').innerHTML= 0;
//            document.querySelector('.budget__income--value').innerHTML= 0;
//            document.querySelector('.budget__expenses--value').innerHTML= 0;
//            document.querySelector('.budget__expenses--percentage').innerHTML= 0;
            
            UICtrl.displayBudget(
                {
                 budget: 0,
                 totalInc: 0,
                 totalExp: 0,
                 percentage: -1
                }
            );
            
            UICtrl.displayMonth();
        }
    };
    
})(budgetController, UIController);

controller.init();