import 'scss/style.scss';

const CREDIT_MIN = 0;
const CREDIT_MAX = 15000000;
const CONTRIBUTION_MIN = 0;
const CONTRIBUTION_MAX = 15000000;
const CREDIT_TERM_MIN = 0;
const CREDIT_TERM_MAX = 50;

const creditText = document.querySelector('#creditText');
const creditRange = document.querySelector('#creditRange');
const firstContributionText = document.querySelector('#firstContributionText');
const firstContributionRange = document.querySelector('#firstContributionRange');
const creditTermText = document.querySelector('#creditTermText');
const creditTermRange = document.querySelector('#creditTermRange');

const numberFormatter = new Intl.NumberFormat('ru');
const currencyFormatter = new Intl.NumberFormat('ru', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 0
});

const dateFormatter = {
  format(value) {
    
    if (value === '0') {    
      return `1 год`;
    }
    
    const years = parseInt(value);
    let text = '';
    const remainderByTen = years % 10;
    const remainderByOneHundred = years % 100;

    if (remainderByOneHundred > 10 && remainderByOneHundred < 15) {
      text = 'лет';
      return `${years} ${text}`;

    } else if (remainderByTen === 1 ) {
      text = 'год'; 
      return `${years} ${text}`;

    } else if (remainderByTen > 1 && remainderByTen < 5) {
      text = 'года';
      return `${years} ${text}`;
    } 

    text = 'лет';
    return `${years} ${text}`;
  }
}

function  filterLetters(inputValue) {
// Исправление - блок с if
  if (!inputValue) return;

  let numericLetters = '';

  for (const letter of inputValue) {
    if ('0123456789'.includes(letter)) {
        numericLetters += letter;
    }
  }
  return numericLetters;
}

function inputHandler (min, max, rangeField, event) {
  let numericLetters = filterLetters(event.target.value);
// Исправление - блок с if
  if (!numericLetters) {
    numericLetters = min;
  }

  let number = parseInt(numericLetters); 

  if (number < min) {
    number = min;
  }

  if (number > max) {
    number = max;
  }

  rangeField.value = number;

  number = numberFormatter.format(parseInt(number));
  event.target.value = number; 
  
}

function focusHandler (event) {
  let numericLetters = filterLetters(event.target.value);
  event.target.value = numberFormatter.format(parseInt(numericLetters));
}

function blurHandler (formatter, event) {
  let numericLetters = filterLetters(event.target.value);
  event.target.value = formatter(numericLetters);
}

function inputRangeHandler (inputField, formatter, event) {
  inputField.value = formatter(parseInt(event.target.value));
}

function focusRangeHandler (event) {
  let numericLetters = filterLetters(event.target.value);
  event.target.value = numberFormatter.format(parseInt(numericLetters));
}

// Set default values 

function setDefaultValue (min, max, textElement, rangeElement, formatter) {
  const middle = (min + max) / 2;
  rangeElement.value = middle;
  textElement.value = formatter(middle);
}

setDefaultValue (
  CREDIT_MIN,
  CREDIT_MAX, 
  creditText, 
  creditRange, 
  currencyFormatter.format
);

setDefaultValue (
  CONTRIBUTION_MIN,
  CONTRIBUTION_MAX, 
  firstContributionText, 
  firstContributionRange, 
  currencyFormatter.format
);

setDefaultValue (
  CREDIT_TERM_MIN,
  CREDIT_TERM_MAX, 
  creditTermText, 
  creditTermRange, 
  dateFormatter.format
);

// Set Reaction

function setReaction (...args) {
  const handler = args.splice(-1)[0];
  
  for (const element of args) {
    element.addEventListener('input', function (event) {
      handler.call(this, args.slice(), event)
    })
  }
}

setReaction (
  creditText,
  creditRange,
  firstContributionText,
  firstContributionRange,
  creditTermText,
  creditTermRange,
  mainProcess
)

mainProcess()

// Срок кредита
creditTermText.addEventListener('input', inputHandler.bind(null, CREDIT_TERM_MIN, CREDIT_TERM_MAX, creditTermRange))

creditTermText.addEventListener('focus', focusHandler);

creditTermText.addEventListener('blur', blurHandler.bind(null, dateFormatter.format))

creditTermRange.addEventListener('input', inputRangeHandler.bind(null, creditTermText, dateFormatter.format));

// Стоимость недвижимости
creditText.addEventListener('input', inputHandler.bind(null, CREDIT_MIN, CREDIT_MAX, creditRange))

creditText.addEventListener('focus', focusHandler);

creditText.addEventListener('blur', blurHandler.bind(null, currencyFormatter.format));

creditRange.addEventListener('input', inputRangeHandler.bind(null, creditText, currencyFormatter.format))

// Первоначальный взнос
firstContributionText.addEventListener('focus', focusRangeHandler)

firstContributionText.addEventListener('input', inputHandler.bind (null, CONTRIBUTION_MIN, CONTRIBUTION_MAX, firstContributionRange))

firstContributionText.addEventListener('blur', blurHandler.bind(null, currencyFormatter.format))

firstContributionRange.addEventListener('input', inputRangeHandler.bind(null, firstContributionText, currencyFormatter.format))

function mainProcess() {
  const credit = parseInt(creditRange.value)
  const firstContribution = parseInt(firstContributionRange.value)
  let creditTerm = parseInt(creditTermRange.value)

  if (!creditTerm) creditTerm = 1;

  let percent = 10 + Math.log(creditTerm) / Math.log(0.5);
  percent = parseInt(percent * 100 + 1) / 100;
  document.querySelector('#percentNumber').value = `${percent} %`;

  const commonDebit = (credit - firstContribution) * (1 + percent) ^ creditTerm;
  document.querySelector('#common').textContent = currencyFormatter.format(commonDebit);

  const overpayment = commonDebit - (credit - firstContribution);
  document.querySelector('#overpayment').textContent = currencyFormatter.format(overpayment);

  const payment = overpayment / (creditTerm * 12);
  document.querySelector('#payment').textContent = currencyFormatter.format(payment);
}
