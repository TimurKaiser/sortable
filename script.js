let heroes = [];
let filteredHeroes = [];
let currentPage = 1;
let pageSize = 20;
let sortOrder = { column: 'name', ordre: false };

const loadData = (data) => {
    heroes = data;
    filteredHeroes = [...heroes];
    SetUpTable('name');
};

fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json')
    .then(response => response.json())
    .then(loadData);

const styletable = () => {
    const tableBody = document.querySelector('#superhero-table tbody');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * pageSize;
    const end = pageSize === 'all' ? filteredHeroes.length : start + pageSize;
    const paginatedHeroes = filteredHeroes.slice(start, end);

    paginatedHeroes.forEach(hero => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${hero.images.md}"></td>
            <td>${hero.name}</td>
            <td>${hero.biography.fullName || 'N/A'}</td>
            <td>${hero.powerstats.intelligence ?? 'N/A'}</td>
            <td>${hero.powerstats.strength ?? 'N/A'}</td>
            <td>${hero.powerstats.speed ?? 'N/A'}</td>
            <td>${hero.powerstats.durability ?? 'N/A'}</td>
            <td>${hero.powerstats.power ?? 'N/A'}</td>
            <td>${hero.powerstats.combat ?? 'N/A'}</td>
            <td>${hero.appearance.race || 'N/A'}</td>
            <td>${hero.appearance.gender}</td>
            <td>${hero.appearance.height.join(', ')}</td>
            <td>${hero.appearance.weight.join(', ')}</td>
            <td>${hero.biography.placeOfBirth || 'N/A'}</td>
            <td>${hero.biography.alignment}</td>
        `;
        tableBody.appendChild(row);
    });
};

const filterResults = () => {
    const search = document.getElementById('search').value.toLowerCase();
    filteredHeroes = heroes.filter(hero => hero.name.toLowerCase().includes(search));
    currentPage = 1;
    styletable();
    updatePagination();
};

const SetUpTable = (column) => {
    const ordre = sortOrder.column === column ? !sortOrder.ordre : true;
    sortOrder = { column, ordre };

    filteredHeroes.sort((a, b) => {
        let valA = getallvalue(a, column) || '';
        let valB = getallvalue(b, column) || '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (!valA && !valB) {
            return 0;
        } else if (!valA) {
            return ordre ? 1 : -1;
        } else if (!valB) {
            return ordre ? -1 : 1;
        }

        return ordre ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
    });

    styletable();
    updatePagination();
};

const setuptable2 = (column) => {
    const ordre = sortOrder.column === column ? !sortOrder.ordre : true;
    sortOrder = { column, ordre };
    let numValA, numValB;
    filteredHeroes.sort((a, b) => {
        let valA = getallvalue(a, column) || '';
        let valB = getallvalue(b, column) || '';

        const reg = new RegExp('meters')

        if (reg.test(valA[1])) {
            numValA = (isNaN(parseFloat(valA[1])) ? Infinity : parseFloat(valA[1])) * 100;
            numValB = isNaN(parseFloat(valB[1])) ? Infinity : parseFloat(valB[1]);
        }
        if (reg.test(valB[1])) {
            numValA = isNaN(parseFloat(valA[1])) ? Infinity : parseFloat(valA[1]);
            numValB = (isNaN(parseFloat(valB[1])) ? Infinity : parseFloat(valB[1])) * 100;
        }
        if (reg.test(valB[1]) && reg.test(valA[1])) {
            numValA = (isNaN(parseFloat(valA[1])) ? Infinity : parseFloat(valA[1])) * 100;
            numValB = (isNaN(parseFloat(valB[1])) ? Infinity : parseFloat(valB[1])) * 100;
        }
        if (!reg.test(valB[1]) && !reg.test(valA[1])) {
            numValA = isNaN(parseFloat(valA[1])) ? Infinity : parseFloat(valA[1]);
            numValB = isNaN(parseFloat(valB[1])) ? Infinity : parseFloat(valB[1]);
        }

        if (numValA !== numValB) {
            return ordre ? (numValA < numValB ? -1 : 1) : (numValA > numValB ? -1 : 1);
        } else if (isNaN(numValA)) {
            return 0;
        }
    });

    styletable();
    updatePagination();
};

const setuptable3 = (column) => {
    const ordre = sortOrder.column === column ? !sortOrder.ordre : true;
    sortOrder = { column, ordre };
    filteredHeroes.sort((a, b) => {
        let valA = getallvalue(a, column) || '';
        let valB = getallvalue(b, column) || '';

        const numValA = isNaN(parseFloat(valA[0])) ? Infinity : parseFloat(valA[0]);
        const numValB = isNaN(parseFloat(valB[0])) ? Infinity : parseFloat(valB[0]);

        if (numValA === Infinity && numValB === Infinity) return 0;
        if (numValA === Infinity) return 1;
        if (numValB === Infinity) return -1;

        return ordre ? numValA - numValB : numValB - numValA;
    });

    styletable();
    updatePagination();
};

const getallvalue = (obj, path) => {
    return path.split('.').reduce((info, collone) => (info && info[collone] !== 'undefined') ? info[collone] : '', obj);
};

const changePageSize = () => {
    const selectedSize = document.getElementById('page-size').value;
    pageSize = selectedSize === 'all' ? 'all' : parseInt(selectedSize);
    currentPage = 1;
    styletable();
    updatePagination();
};

const updatePagination = () => {
    const pagination = document.getElementById('pagination');
    const pageInfo = document.getElementById('page-info');

    if (pageSize === 'all' || filteredHeroes.length <= pageSize) {
        pagination.classList.add('hidden');
        return;
    }

    pagination.classList.remove('hidden');
    const totalPages = Math.ceil(filteredHeroes.length / pageSize);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
};

const prevPage = () => {
    if (currentPage > 1) {
        currentPage--;
        styletable();
        updatePagination();
    }
};

const nextPage = () => {
    const totalPages = Math.ceil(filteredHeroes.length / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        styletable();
        updatePagination();
    }
};