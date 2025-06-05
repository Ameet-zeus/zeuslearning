let myArray = [1];
let base = 10;

function sub(e) {
    e.preventDefault();
    let n = parseInt(document.getElementById("number").value);
    document.getElementById("result").innerText = factorial(n);
    myArray = [1]; 
}

function factorial(n) {
    if (n < 0) {
        return "Error: Negative input";
    } else if (n === 0 || n === 1) {
        return "1";
    } else {
        let i = 2;
        factorialHelper(i, n);

        const digitSize = Math.floor(Math.log10(base));

        return myArray.map((val, idx) => {
            return (idx === 0) ? val.toString() : padDigits(val, digitSize);
        }).join('');
    }
}

function padDigits(num, size) {
    let s = num.toString();
    while (s.length < size) s = "0" + s;
    return s;
}

function factorialHelper(i, n) {
    if (i > n) return;

    let temp = i;
    let shift = 0;
    let result = [0];

    while (temp !== 0) {
        let digit = temp % base;
        if (digit !== 0) {
            let tempArray = multiplyArray(myArray, digit);
            for (let s = 0; s < shift; s++) {
                tempArray.push(0);
            }
            result = addArrays(result, tempArray);
        }
        temp = Math.floor(temp / base);
        shift++;
    }

    myArray = result;
    factorialHelper(i + 1, n);
}

function multiplyArray(arr, digit) {
    let carry = 0;
    let result = [];

    for (let i = arr.length - 1; i >= 0; i--) {
        let prod = arr[i] * digit + carry;
        result.unshift(prod % base);
        carry = Math.floor(prod / base);
    }

    while (carry > 0) {
        result.unshift(carry % base);
        carry = Math.floor(carry / base);
    }

    return result;
}

function addArrays(arr1, arr2) {
    let maxLength = Math.max(arr1.length, arr2.length);
    let result = [];
    let carry = 0;

    while (arr1.length < maxLength) arr1.unshift(0);
    while (arr2.length < maxLength) arr2.unshift(0);

    for (let i = maxLength - 1; i >= 0; i--) {
        let sum = arr1[i] + arr2[i] + carry;
        result.unshift(sum % base);
        carry = Math.floor(sum / base);
    }

    if (carry > 0) result.unshift(carry);

    return result;
}