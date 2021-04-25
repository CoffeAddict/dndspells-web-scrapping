const rp = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs')

let qs = `filter-class=0&filter-search=&filter-verbal=&filter-somatic=&filter-material=&filter-concentration=&filter-ritual=&filter-sub-class=&filter-source=44&filter-source=21&filter-source=48&filter-source=68&filter-source=31&filter-source=6&filter-source=26&filter-source=20&filter-source=52&filter-source=41&filter-source=49&filter-source=59&filter-source=62&filter-source=43&filter-source=38&filter-source=7&filter-source=47&filter-source=66&filter-source=56&filter-source=55&filter-source=40&filter-source=8&filter-source=33&filter-source=57&filter-source=61&filter-source=60&filter-source=9&filter-source=10&filter-source=11&filter-source=34&filter-source=53&filter-source=58&filter-source=51&filter-source=12&filter-source=50&filter-source=42&filter-source=14&filter-source=67&filter-source=17&filter-source=18&filter-source=16&filter-source=28&filter-source=25&filter-source=22&filter-source=15&filter-source=35&filter-source=36&filter-source=37&filter-source=19&filter-source=27`

let currentPage = 1
let maxPage

let spells = []

let retrySpellsList = []

let spellsContent = []

async function getSpellDetails (spellList) {
    for (spell of spellList) {
        await rp({
            url: `http://dnd5e.wikidot.com/spell:${spell}`,
            transform: body => cheerio.load(body)
        })
            .then($ => {
                console.log('Resquested', $('.page-title.page-header span').html())
                spellsContent.push({
                    name: $('.page-title.page-header span').html(),
                    content: $('#page-content').html()
                })
                retrySpellsList.filter(actualSpell => spell != actualSpell)
            })
            .catch(() => {
                console.error(`Error requesting spell: ${spell}`)
                retrySpellsList.push(spell)
            })
    }

    if (retrySpellsList.length > 0) {
        console.log(retrySpellsList)
        getSpellDetails(retrySpellsList)
    }

    fs.writeFile('spells.txt', JSON.stringify(spellsContent), error => {
        if (error) return console.log(error)
    })
}

function getDNDSpells (pageNumber) {
    rp({
        url: `https://www.dndbeyond.com/spells?${qs}&page=${pageNumber}`,
        transform: body => cheerio.load(body)
    })
        .then($ => {
            maxPage = $('.b-pagination-list > .b-pagination-item:not(.b-pagination-item-next):nth-last-child(2) a').html()

            let spellList = $(`div[data-type=spells]`)
            for (let i = 0; i < spellList.length; i++) {
                const element = spellList[i];
                let spellName = $(element).find('.spell-name .name a').html()
                let formatedSpellName = spellName
                    .toLowerCase()
                    .replace(' ', '-')
                    .replace(`'`, '')
                    .replace('’', '')
                spells.push(formatedSpellName)
            }

            console.log('Current Page:', currentPage, ' Max:', maxPage)

            // if (currentPage <= maxPage) {
            if (currentPage <= 1) {
                currentPage++
                getDNDSpells(currentPage)
            } else {
                console.log('Done getting spells name!')
                getSpellDetails(spells)
            }
        })
        .catch(error => {
            console.error(error)
        })
}

getDNDSpells(currentPage);