var budgetController = (function() {
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	}

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	}

	Expense.prototype.calculateSinglePercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round(this.value / totalIncome * 100);
		}
	}

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	}

	var calculateTotal = function(type) {
		var sum = 0;

		data.allItems[type].forEach(function(current) {
			sum += current.value;
		});

		data.totals[type] = sum;
	}

	var data = {
		allItems: {
			inc: [],
			exp: []
		},

		totals: {
			inc: 0,
			exp: 0
		},

		budget: 0,

		percentage: -1
	}

	return {
		addItem: function(type, desc, val) {
			var id = 0, newItem;

			if (data.allItems[type].length > 0) {
				id = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}

			if (type === 'inc') {
				newItem = new Income(id, desc, val);
			} else {
				newItem = new Expense(id, desc, val);
			}

			data.allItems[type].push(newItem);

			return newItem;
		},

		deleteItem: function(type, id) {
			var ids, index;

			ids = data.allItems[type].map(function(element) {
				return element.id;
			});

			console.log(ids);

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function() {
			calculateTotal('inc');
			calculateTotal('exp');

			data.budget = data.totals.inc - data.totals.exp;

			if (data.totals.inc > 0) {
				data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
			} else {
				data.percentage = -1;
			}
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(element) {
				element.calculateSinglePercentage(data.totals.inc);
			})
		},

		getPercentages: function() {
			var allPercentages = data.allItems.exp.map(function(element) {
				return element.getPercentage();
			});

			return allPercentages;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalIncome: data.totals.inc,
				totalExpense: data.totals.exp,
				percentage: data.percentage
			}
		}
	}
})();

var uiController = (function() {
	var domStrings = {
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
		itemPercentage: '.item__percentage',
		monthLabel: '.budget__title--month'
	};


	var formatNumber = function(num, type) {
		num = num.toFixed(2);
		num = parseFloat(num);
		num = num.toLocaleString('en-IN');

		var sign;

		type === 'inc' ? sign = '+ ' : sign = '- ';

		return sign + num;
	};

	var nodeListForEach = function(list, callBack) {
		for (var i = 0; i < list.length; i++) {
			callBack(list[i], i);
		}
	}

	return {
		getInput: function() {
			return {
				type: document.querySelector(domStrings.inputType).value,
				description: document.querySelector(domStrings.inputDescription).value,
				value: parseFloat(document.querySelector(domStrings.inputValue).value)
			};
		},

		getDomStrings: function() {
			return domStrings;
		},

		addListItem: function(item, type) {
			var html, newHtml;

			if (type === 'inc') {
				element = domStrings.incomeContainer;

				html = "<div class='item clearfix' id='inc-%id%'><div class='item__description'>%description%</div><div class='right clearfix'><div class='item__value'>%value%</div><div class='item__delete'><button class='item__delete--btn'><i class='ion-ios-close-outline'></i></button></div></div></div>";
			} else {
				element = domStrings.expensesContainer;

				html = "<div class='item clearfix' id='exp-%id%'><div class='item__description'>%description%</div><div class='right clearfix'><div class='item__value'>%value%</div><div class='item__percentage'></div><div class='item__delete'><button class='item__delete--btn'><i class='ion-ios-close-outline'></i></button></div></div></div>";
			}

			newHtml = html.replace('%id%', item.id);
			newHtml = newHtml.replace('%description%', item.description);
			newHtml = newHtml.replace('%value%', formatNumber(item.value, type));

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function(itemId) {
			var element = document.getElementById(itemId);
			element.parentNode.removeChild(element);
		},

		displayBudget: function(budget) {
			document.querySelector(domStrings.budgetLabel).textContent = formatNumber(budget.budget, budget.budget > 0 ? 'inc' : 'exp');
			document.querySelector(domStrings.incomeLabel).textContent = formatNumber(budget.totalIncome, 'inc');
			document.querySelector(domStrings.expensesLabel).textContent = formatNumber(budget.totalExpense, 'exp');

			if (budget.percentage > 0) {
				document.querySelector(domStrings.percentageLabel).textContent = budget.percentage + '%';
			} else {
				document.querySelector(domStrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(domStrings.itemPercentage);

			nodeListForEach(fields, function(element, index){
				if (percentages[index] > 0) {
					element.textContent = percentages[index] + '%';
				} else {
					element.textContent = '---';
				}
			});
		},

		displayMonth: function() {
			var now = new Date();

			var month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

			var currentMonth = month[now.getMonth()];

			document.querySelector(domStrings.monthLabel).textContent = currentMonth;
		},

		changeType: function() {
			var fields = document.querySelectorAll(
				domStrings.inputType + ', ' +
				domStrings.inputDescription + ', ' +
				domStrings.inputValue
			);

			nodeListForEach(fields, function(element, index) {
				element.classList.toggle('red-focus');
			});

			document.querySelector(domStrings.inputBtn).classList.toggle('red');
		},

		clearFields: function() {
			var fields, fieldsArray;

			fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);

			// List to Array
			fieldsArray = Array.prototype.slice.call(fields);

			fieldsArray.forEach(function(element, index, array) {
				element.value = "";
			})

			fieldsArray[0].focus();
		}
	};
})();

// Global app controller
var appController = (function(budgetCtrl, uiCtrl) {
	var setupEventListeners = function() {
		var domStrings = uiController.getDomStrings();

		document.querySelector(domStrings.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(domStrings.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(domStrings.inputType).addEventListener('change', uiCtrl.changeType);
	}

	var updateBudget = function() {
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// 2. Return the budget
		var budget = budgetCtrl.getBudget();

		// 3. Display the budget on the ui
		uiCtrl.displayBudget(budget);
	}


	var updatePercentages = function() {
		// 1. Calculate the percentages
		budgetCtrl.calculatePercentages();

		// 2. Get percentages from the budget controller
		var percentages = budgetCtrl.getPercentages();

		// 3. Update the ui
		uiCtrl.displayPercentages(percentages);
	}

	var ctrlAddItem = function() {
		// 1. Get the field input value
		var input = uiCtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 2. Add the item to the budget controller
			var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. Add the item to the ui controller
			uiCtrl.addListItem(newItem, input.type);

			// 4. Clear input fields
			uiCtrl.clearFields();

			// 4. Calculate and update the budget
			updateBudget();

			// 5. Update percentage
			updatePercentages();
		}
	}

	var ctrlDeleteItem = function(event) {
		var itemId;

		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemId) {
			splitId = itemId.split('-');
			type = splitId[0];
			id = parseInt(splitId[1]);

			// 1. Delete the item from the data structure
			budgetCtrl.deleteItem(type, id);

			// 2. Delete the item from the ui
			uiCtrl.deleteListItem(itemId);

			// 3. Update and show the new budget
			updateBudget();

			// 4. Update percentages
			updatePercentages();
		}
	};

	return {
		init: function() {
			uiCtrl.displayMonth();

			uiCtrl.displayBudget({
				budget: 0,
				totalIncome: 0,
				totalExpense: 0,
				percentage: -1
			});

			setupEventListeners();
		}
	};
})(budgetController, uiController);

appController.init();