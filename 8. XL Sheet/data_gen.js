'use strict';

const fs = require('fs');

function generateRandomData(numRecords) {
    const firstNames = ['Raj', 'John', 'Mia', 'Ava', 'Sophie', 'David', 'James', 'Emily', 'Chris', 'Emma'];
    const lastNames = ['Solanki', 'Smith', 'Johnson', 'Taylor', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Anderson'];
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomAge = () => Math.floor(Math.random() * (65 - 18 + 1)) + 18; 
    const getRandomSalary = () => Math.floor(Math.random() * (2000000 - 30000 + 1)) + 30000;
    const data = [];

    for (let i = 1; i <= numRecords; i++) {
        data.push({
            id: i,
            firstName: getRandomElement(firstNames),
            lastName: getRandomElement(lastNames),
            age: getRandomAge(),
            salary: getRandomSalary()
        });
    }

    return data;
}

const randomData = generateRandomData(100000);

fs.writeFile('./data/info.json', JSON.stringify(randomData, null, 2), (err) => {
    if (err) {
        console.error('Error writing to file', err);
    } else {
        console.log('Data successfully written to info.json');
    }
});
