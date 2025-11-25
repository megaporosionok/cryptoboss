// Инициализация начальных значений
let money = 5000;
let happiness = 5;
let multiplier = 2;
let risk = 100;
let lifecost = 0;
let turn = 1;
let totalMaintenanceCost = 0;
let yesButton;
let noButton;

// Получение ссылки на кнопку "Конец хода"
const endTurnButton = document.getElementById('end-turn-button');

// Обновляем кнопку "Конец хода" для Material Design Lite
if (window.componentHandler) {
    window.componentHandler.upgradeElement(endTurnButton);
}

// Получаем элемент с id "money-slider" и обновляем его для Material Design Lite
const moneySlider = document.getElementById('money-slider');
if (window.componentHandler) {
    window.componentHandler.upgradeElement(moneySlider);
}

// Получаем элемент с id "money"
const moneyElement = document.getElementById('money');

// Обновляем его содержимое, используя значение переменной money
moneyElement.textContent = money.toLocaleString() + '$';

// Установка кнопки "Конец хода" неактивной при инициализации страницы
endTurnButton.disabled = true;
updateLifeCost();

// Обновление отображения финансов и других данных
function update_information() {
    document.getElementById('money').textContent = money.toLocaleString() + '$';
    document.getElementById('happiness-value').textContent = happiness;
    document.getElementById('multiplier').textContent = multiplier;
    document.getElementById('risk').textContent = risk + '%';
    setSliderRange();
    updateSelectedMoney();
}

// Функция для обновления счетчика ходов
function updateTurnCounter(turn) {
    const turnCounter = document.getElementById('turn-counter');
    turnCounter.textContent = `Ход: ${turn}`;
}

// Определение активов с учетом стоимости обслуживания
const assets = [
    { name: 'Машина', price: 30000, happinessPrice: 3, maintenanceCost: 50, owned: false, achieved: false },
    { name: 'Квартира', price: 200000, happinessPrice: 3, maintenanceCost: 500, owned: false, achieved: false },
    { name: 'Дача', price: 500000, happinessPrice: 3, maintenanceCost: 1000, owned: false, achieved: false },
    { name: 'Пентхаус', price: 2000000, happinessPrice: 2, maintenanceCost: 1000, owned: false, achieved: false },
    { name: 'Вертолет', price: 5000000, happinessPrice: 2, maintenanceCost: 3000, owned: false, achieved: false },
    { name: 'Самолет', price: 10000000, happinessPrice: 2, maintenanceCost: 5000, owned: false, achieved: false },
    { name: 'Вилла', price: 25000000, happinessPrice: 1, maintenanceCost: 10000, owned: false, achieved: false },
    { name: 'Яхта', price: 100000000, happinessPrice: 1, maintenanceCost: 100000, owned: false, achieved: false },
	{ name: 'Ядерка на кремль', price: 10000000000, happinessPrice: 1000, maintenanceCost: 0, owned: false, achieved: false },
    // Добавьте остальные активы
];

function displayAssets() {
    const assetTableBody = document.getElementById('asset-body');
    assetTableBody.innerHTML = '';

    const totalMaintenanceCostContainer = document.getElementById('total-maintenance-cost-container');
    totalMaintenanceCostContainer.innerHTML = ''; // Очищаем контейнер перед обновлением

    assets.forEach((asset, index) => {
        const row = document.createElement('tr');
        row.className = 'asset-item';
        
        const infoCell = document.createElement('td');
        infoCell.className = 'asset-info';
        infoCell.textContent = `${asset.name}: ${asset.price.toLocaleString()} $  Обслуживание: ${asset.maintenanceCost} $/день`;

        const buttonCell = document.createElement('td');
        buttonCell.className = 'asset-buttons';
        			
        if (!asset.owned) {
            const buyButton = document.createElement('button');
            buyButton.textContent = 'Купить';
            buyButton.classList.add('mdl-button', 'mdl-js-button', 'mdl-button--raised', 'mdl-button--accent');
            buyButton.onclick = () => buyAsset(index);
            if (asset.price > money) {
                buyButton.disabled = true; // Выключаем кнопку, если не хватает денег
            }
            buttonCell.appendChild(buyButton);
            if (window.componentHandler) {
                window.componentHandler.upgradeElement(buyButton);
            }
        } else {
            const sellButton = document.createElement('button');
            sellButton.textContent = 'Продать -25%';
            sellButton.classList.add('mdl-button', 'mdl-js-button', 'mdl-button--raised', 'mdl-button--accent');
            sellButton.onclick = () => sellAsset(index);
            buttonCell.appendChild(sellButton);
            if (window.componentHandler) {
                window.componentHandler.upgradeElement(sellButton);
            }
        }

        // Создаем ячейку для отображения счастья
        const happinessCell = document.createElement('td');
        happinessCell.className = 'happiness-span';
		
        // Создаем span для отображения счастья только если актив не достигнут
        if (!asset.achived) {
            const happinessSpan = document.createElement('span');
            happinessSpan.textContent = `+${asset.happinessPrice} счастья`;
            happinessSpan.style.marginLeft = '10px'; // Пример отступа, можно настроить под свои требования
            happinessCell.appendChild(happinessSpan);
        }

        row.appendChild(infoCell);
        row.appendChild(buttonCell);
        row.appendChild(happinessCell); // Поменяли порядок добавления ячеек, чтобы happinessSpan был справа от кнопок

        assetTableBody.appendChild(row);
    });

    const totalMaintenanceCostDiv = document.createElement('div');
    totalMaintenanceCostDiv.textContent = `Общие жизненные расходы: ${Math.round(calculateMaintenanceCost() + lifecost)} $/день`;
    totalMaintenanceCostContainer.appendChild(totalMaintenanceCostDiv);
}

function buyAsset(index) {
    const asset = assets[index];
    if (money >= asset.price) {
        money -= asset.price;
        if (!asset.achived) { // Проверяем, не достигнут ли уже актив
            happiness += asset.happinessPrice;
            asset.achived = true; // Помечаем актив как достигнутый
        }
        asset.owned = true;
        updateLifeCost();
        calculateMaintenanceCost();
        displayAssets();
        update_information();
    }
    return money; // Возвращаем обновленное значение money
}

// Функция для продажи актива
function sellAsset(index) {
    const asset = assets[index];
    money += asset.price * 0.75; // Цена продажи в 2 раза меньше цены покупки
    asset.owned = false;
    updateLifeCost();
    calculateMaintenanceCost();
    displayAssets();
    update_information();
    return money; // Возвращаем обновленное значение money
}

// Функция для потери актива
function lostAsset(index) {
    const asset = assets[index];
    asset.owned = false;
    displayAssets();
    update_information();
}

function calculateMaintenanceCost() {
    let totalMaintenanceCost = 0;
    assets.forEach(asset => {
        if (asset.owned) {
            totalMaintenanceCost += asset.maintenanceCost;
        }
    });
    return Math.round(totalMaintenanceCost);
}

// Вызов функции для отображения активов при загрузке страницы
displayAssets();

// Функция для генерации случайного целого числа в заданном диапазоне включительно
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Определяем массив событий и их весов
const events = [
    {
		description: 'disaster 1',
		moneyChange: 0, happinessChange: 0, disaster: 1, weight: 0
	},
	{
		description: 'Обычный рабочий день',
		moneyChange: 0, happinessChange: 0, weight: 200
	},
    {
        description: function() {
            return `Ваш друг попросил вас о помощи. Принять: -${1000 + Math.round(Math.abs(money) * 0.25)}$, +1 счастье. Отказаться: -1 счастье.`;
        },
        options: [
            { text: 'Принять', moneyChange: function() { return -(1000 + Math.round(Math.abs(money) * 0.25)) }, happinessChange: 1 },
            { text: 'Отказаться', moneyChange: 0, happinessChange: -1 }
        ],
        weight: 8
    },
    { 
         description: function() {
			return `У вас есть шанс провернуть темное дельце. Принять: +${1000 + Math.round(Math.abs(money) * 2)}$, -2 счастье. Отказаться: -${Math.round(Math.abs(money) * 0.05)}$.`;
		 },
        options: [
            { text: 'Принять', moneyChange: function() { return +(1000 + Math.round(Math.abs(money) * 2)) }, happinessChange: -2 },
            { text: 'Отказаться', moneyChange: function() { return -(Math.round(Math.abs(money) * 0.05)) }, happinessChange: 0 }
        ],
        weight: 4
    },
    { 
        description: function() {
			return `Есть хорошая возможность помочь ЗСУ. Принять: -${1000 + Math.round(Math.abs(money) * 0.3)}$, +1 счастье.`;
		},
        options: [
            { text: 'Принять', moneyChange: function() { return -(1000 + Math.round(Math.abs(money) * 0.3)) }, happinessChange: +1 },
            { text: 'Отказаться', moneyChange: 0, happinessChange: 0 }
        ],
        weight: 8
    },
	{ 
        description: function() {
			return `Бандиты украли вашего близкого и требуют выкуп. Принять: -${Math.round(Math.abs(money) * 0.9)}$ Отказаться: -3 счастья.`;
		},
        options: [
            { text: 'Принять', moneyChange: function() { return -(Math.round(Math.abs(money) * 0.9)) }, happinessChange: 0 },
            { text: 'Отказаться', moneyChange: 0, happinessChange: -3 }
        ],
        weight: 0
    },
    { 
        description: 'Умер ваш любимый кот: -1 счастье.',
        moneyChange: 0, happinessChange: -1, weight: 2
    },
	{ 
        description: 'Вы опять забыли полить ваш кактус и он завял: -1 счастье.',
        moneyChange: 0, happinessChange: -1, weight: 2
    },
	{ 
        description: 'Психиатр сказал что все ваши проблемы из-за криптотрейдинга: -1 счастье.',
        moneyChange: 0, happinessChange: -1, weight: 2
    },
	{ 
        description: 'Жена ушла к "нормальному мужику" (сталевару): -1 счастье.',
        moneyChange: 0, happinessChange: -1, weight: 2
    },
	{ 
        description: 'Ночной образ жизни сделал вас похожим на зомби: -1 счастье.',
        moneyChange: 0, happinessChange: -1, weight: 2
    },
	{ 
        description: 'Вечноуставшие глаза и геморрой на жопе делает вас несчастным: -1 счастье.',
        moneyChange: 0, happinessChange: -1, weight: 2
    },
	{
		description: function() {
			return `Налоговая добралась до вас. -${Math.round(Math.abs(money) * 0.5)}$.`;
		},
		moneyChange: function() {
			return -(Math.round(Math.abs(money) * 0.5));
		},
		happinessChange: 0,
		weight: 4
	}

];

// Функция для генерации случайного события
function generateRandomEvent() {
    const eventField = document.getElementById('event-field');
    eventField.innerHTML = ''; // Очистка содержимого eventField перед добавлением нового события

    // Вычисляем общий вес всех событий
    const totalWeight = events.reduce((acc, curr) => acc + curr.weight, 0);

    // Генерируем случайное число от 1 до общего веса
    const randomNum = getRandomInt(1, totalWeight);

    // Переменная для хранения выбранного события
    let selectedEvent;

    // Ищем выбранное событие на основе случайного числа и весов
    let cumulativeWeight = 0;
	
    for (const event of events) {
        cumulativeWeight += event.weight;
        if (randomNum <= cumulativeWeight) {
            selectedEvent = event;
            break;
        }
    }

	// Создаем элементы для отображения выбранного события
	const eventDescription = document.createElement('div');

	// Проверяем, является ли описание функцией
	if (typeof selectedEvent.description === 'function') {
		eventDescription.textContent = selectedEvent.description();
	} else {
		eventDescription.textContent = selectedEvent.description;
	}

    // Добавляем текстовое описание события в eventDescription
    eventField.appendChild(eventDescription);

    // После создания кнопок
    if (selectedEvent.options) {
        selectedEvent.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.classList.add('mdl-button', 'mdl-js-button', 'mdl-button--raised', 'mdl-button--colored');
            button.onclick = () => handleEventResponse({ moneyChange: option.moneyChange, happinessChange: option.happinessChange });

            // Добавляем кнопку на страницу
            eventField.appendChild(button);
            if (window.componentHandler) {
                window.componentHandler.upgradeElement(button);
            }

            // Устанавливаем соответствующую кнопку в переменную yesButton или noButton
            if (option.text === 'Принять') {
                yesButton = button;
            } else if (option.text === 'Отказаться') {
                noButton = button;
            }
        });
    } else {
        // Если событие не имеет параметра "options", выполняем рассчет и обновляем данные
        handleEventResponse({ moneyChange: selectedEvent.moneyChange, happinessChange: selectedEvent.happinessChange });
		displayAssets();
    }

    // Проверяем наличие параметра disaster
    if (selectedEvent.disaster) {
        // Вызываем функцию для потери актива и передаем значение disaster
        lostAsset(selectedEvent.disaster - 1);
		// Активируем кнопку "Конец хода" в конце обработки события
		endTurnButton.disabled = false;
		displayAssets();
    }

}
	
// Функция для обработки ответа на случайное событие
function handleEventResponse(change) {  
    // Проверяем тип данных moneyChange
    if (typeof change.moneyChange === 'function') {
		console.log("Изменение в деньгах:", change.moneyChange());
        money += change.moneyChange(); // Вызываем функцию moneyChange
    } else {
		console.log("Изменение в деньгах:", change.moneyChange);
        money += change.moneyChange; // Или используем значение напрямую
    }
    happiness += change.happinessChange;

    // Обновляем отображение активов и других данных
    displayAssets();
    update_information();
	setMaxSliderValue();
	updateSelectedMoney();

    // Отключаем кнопки после выбора
    if (yesButton) yesButton.disabled = true;
    if (noButton) noButton.disabled = true;
    endTurnButton.disabled = false; // Активируем кнопку "Конец хода"
}

// Добавим слушатель события input на ползунке
document.getElementById('money-slider').addEventListener('input', updateSelectedMoney);

// Измененная функция для установки минимального и максимального значения ползунка
function setSliderRange() {
    const moneySlider = document.getElementById('money-slider');
    moneySlider.min = 0;
    moneySlider.max = money;
}

// Вызов функции для установки начального значения ползунка при загрузке страницы
setSliderRange();

// Функция для установки максимального значения ползунка
function setMaxSliderValue() {
    const moneySlider = document.getElementById('money-slider');
    moneySlider.max = money - Math.round(calculateMaintenanceCost() + lifecost); // Установим максимальное значение ползунка равным текущему балансу денег
}

// Новая функция для обновления отображения выбранной суммы денег
function updateSelectedMoney() {
    const moneySlider = document.getElementById('money-slider');
    const selectedMoneyText = document.getElementById('selected-money');
    const selectedMoneyValue = parseInt(moneySlider.value);

    // Учтем максимальное значение money
    const maxMoney = Math.min(selectedMoneyValue, money);
    selectedMoneyText.textContent = `Завести на биржу: ${maxMoney} $`;
}

// Функция для обработки торговли на бирже
function trade() {
    // Получение значения ползунка
    const moneySlider = document.getElementById('money-slider');
    const tradeAmount = parseInt(moneySlider.value);

    // Логика торговли
	const randomNum = getRandomInt(0, 100);
	const positiveOutcome = randomNum <= risk;
	console.log("Random number:", randomNum);
	console.log("Positive outcome:", positiveOutcome);

    if (positiveOutcome) {
        const rawTradeResult = tradeAmount * multiplier;
        const roundedTradeResult = Math.round(rawTradeResult);
        money += roundedTradeResult - tradeAmount; // Прибавляем округленный результат и вычитаем изначальную сумму
        console.log("positive!");
    } else {
        money -= tradeAmount;
        console.log("negative!");
    }
}

function generateRandomTradeValues() {
    risk = getRandomInt(10, 80); // Пример: случайный риск от 10% до 80%
    multiplier = getRandomInt(110, 300) / 100; // Пример: случайный мультипликатор от 1.1 до 3.0

   
    // Если risk находится в диапазоне от 10 до 30, увеличиваем multiplier на 2
    if (risk >= 10 && risk < 30) {
            multiplier = multiplier + 6;
			multiplier = parseFloat(multiplier.toFixed(2));
    }
}

function updateLifeCost() {
    const minMoney = 1000; // Минимальное значение money
    const maxMoney = 1000000; // Максимальное значение money
    const minLifeCost = 50; // Минимальное значение lifecost
    const maxLifeCost = 5000; // Максимальное значение lifecost
    
    // Проверка граничных значений money и установка соответствующего lifecost
    if (money <= minMoney) {
        lifecost = minLifeCost;
    } else if (money >= maxMoney) {
        lifecost = maxLifeCost;
    } else {
        // Пропорциональное изменение lifecost в интервале от minMoney до maxMoney
        lifecost = minLifeCost + (maxLifeCost - minLifeCost) * ((money - minMoney) / (maxMoney - minMoney));
    }
}
	
	setMaxSliderValue();
	endTurnButton.disabled = false;
	
// Функция конец хода.
function end_turn() {
	disableAllButtons();
	checkAndSellAsset();
	checkLossConditions();
	checkWinConditions();
    trade();
	endTurnButton.disabled = true;
    updateSelectedMoney();
	money -= Math.round(calculateMaintenanceCost() + lifecost);
	updateLifeCost();
    generateRandomTradeValues();
    update_information();
	updateEventWeight();
    generateRandomEvent();
    setSliderRange();
	turn++;
    updateTurnCounter(turn);
    setMaxSliderValue();
}

function checkAndSellAsset() {
    if (money < 0) {
        // Фильтруем активы, чтобы получить только те, которые уже приобретены
        const ownedAssets = assets.filter(asset => asset.owned);

        if (ownedAssets.length > 0) {
            // Находим актив с максимальной ценой
            const maxPriceAsset = ownedAssets.reduce((prev, current) => {
                return (prev.price > current.price) ? prev : current;
            });

            // Продаем актив с максимальной ценой
            const maxPriceIndex = assets.findIndex(asset => asset === maxPriceAsset);
            sellAsset(maxPriceIndex);
        }
    }
}

// Функция для отображения модального окна
function showModal(modalId, closeButtonClass, playAgainButtonId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'block';

  const closeButton = modal.querySelector(closeButtonClass);
  const playAgainButton = document.getElementById(playAgainButtonId);
  playAgainButton.classList.add('mdl-button', 'mdl-js-button', 'mdl-button--raised', 'mdl-button--colored');
  if (window.componentHandler) {
      window.componentHandler.upgradeElement(playAgainButton);
  }

  // Закрытие модального окна при нажатии на крестик
  closeButton.onclick = function() {
    modal.style.display = 'none';
  }

  // Сброс игры при нажатии на кнопку "Сыграть еще раз"
  playAgainButton.onclick = function() {
    modal.style.display = 'none';
    location.reload(); // Этот метод перезагружает текущую страницу //
  }

  // Закрытие модального окна при клике вне его области
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
}

// Проверка условий поражения и отображение модального окна при проигрыше
function checkLossConditions() {
  if (money < 0 || happiness < 0) {
    showModal('modal', '.close', 'play-again-button-loss');
  }
}

// Проверка условий выигрыша и отображение модального окна при выигрыше
function checkWinConditions() {
  const ownedAsset = assets.find(asset => asset.name === 'Ядерка на кремль' && asset.owned);
  if (ownedAsset) {
    showModal('modal2', '.close', 'play-again-button-win');
  }
}

// Включение особо злых событий
function updateEventWeight() {
    if (money > 20000 && happiness > 5 && events.length > 5) {
        events[5].weight = 2;
    }
}

// Включение кнопок покупки активов 
function disableAllButtons() {
    const buttons = document.querySelectorAll('.asset-buttons button');
    buttons.forEach(button => {
        button.disabled = true;
    });
}