const rp = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs')
const createHTML = require('create-html')
const cliProgress = require('cli-progress')
const _colors = require('colors')

let qs = `filter-class=0&filter-search=&filter-verbal=&filter-somatic=&filter-material=&filter-concentration=&filter-ritual=&filter-sub-class=&filter-source=44&filter-source=21&filter-source=48&filter-source=68&filter-source=31&filter-source=6&filter-source=26&filter-source=20&filter-source=52&filter-source=41&filter-source=49&filter-source=59&filter-source=62&filter-source=43&filter-source=38&filter-source=7&filter-source=47&filter-source=66&filter-source=56&filter-source=55&filter-source=40&filter-source=8&filter-source=33&filter-source=57&filter-source=61&filter-source=60&filter-source=9&filter-source=10&filter-source=11&filter-source=34&filter-source=53&filter-source=58&filter-source=51&filter-source=12&filter-source=50&filter-source=42&filter-source=14&filter-source=67&filter-source=17&filter-source=18&filter-source=16&filter-source=28&filter-source=25&filter-source=22&filter-source=15&filter-source=35&filter-source=36&filter-source=37&filter-source=19&filter-source=27&sort=level`

let currentPage = 1
let maxPage = null

let spells = []
let retrySpellsList = []
let spellsContent = []

const progressBar = new cliProgress.SingleBar({
    format: '{percentage}% || ' + _colors.magenta('{bar}') + ' || {value}/{total} Spells || ETA: {eta}s',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});

function getDNDSpells (pageNumber) {
    rp({
        url: `https://www.dndbeyond.com/spells?${qs}&page=${pageNumber}`,
        transform: body => cheerio.load(body)
    })
        .then($ => {
            if (maxPage == null) maxPage = $('.b-pagination-list > .b-pagination-item:not(.b-pagination-item-next):nth-last-child(2) a').html()

            let spellList = $(`div[data-type=spells]`)
            for (let i = 0; i < spellList.length; i++) {
                const element = spellList[i];
                let spellName = $(element).find('.spell-name .name a').html()
                let formatedSpellName = spellName
                    .toLowerCase()
                    .replace(/'/g, '')
                    .replace(/’/g, '')
                    .replace(/ /g, '-')
                spells.push(formatedSpellName)
            }

            console.log('Current Page:', currentPage, ' Max:', maxPage)

            if (currentPage <= maxPage) {
                currentPage++
                getDNDSpells(currentPage)
            } else {
                console.log('Done getting spells name!')

                progressBar.start(spells.length, 0)

                getSpellDetails(spells)
            }
        })
        .catch(error => {
            console.error(error)
        })
}

async function getSpellDetails (spellList) {
    for (spell of spellList) {
        spell = await checkExceptions(spell)

        await rp({
            url: `http://dnd5e.wikidot.com/spell:${spell}`,
            transform: body => cheerio.load(body)
        })
            .then($ => {
                progressBar.increment()
                spellsContent.push({
                    name: $('.page-title.page-header span').html(),
                    content: $('#page-content').html()
                })
                retrySpellsList.filter(actualSpell => spell != actualSpell)
            })
            .catch(() => {
                console.error(`Error requesting spell: ${spell}`)
                retrySpellsList.push(spell)
                currentIndex--
            })

        currentIndex++
    }

    if (retrySpellsList.length > 0) {
        console.log(retrySpellsList)
        getSpellDetails(retrySpellsList)
    }

    progressBar.stop()

    createHTMLFile()
}

function createHTMLFile () {
    let bodyContent = '<div class="main-container">'

    spellsContent.forEach(localSpell => {
        bodyContent += `
            <div class="spell-container">
                <div class="spell-name">${localSpell.name}</div>
                ${localSpell.content}
            </div>
        `
    })

    bodyContent += '</div>'

    var html = createHTML({
        title: 'DND Spells',
        css: ['fonts.css', 'styles.css'],
        lang: 'en',
        body: bodyContent
    })

    fs.writeFile('index.html', html, error => {
        if (error) return console.log(error)
    })
}

function checkExceptions (spellName) {
    switch (spellName) {
        case 'maximilians-earthen-grasp':
            return 'maximillians-earthen-grasp'
        case 'snillocs-snowball-swarm':
            return 'snillocs-snowball-storm'
        default:
            return spellName
    }
}

getDNDSpells(currentPage);