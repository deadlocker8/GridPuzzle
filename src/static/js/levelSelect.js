document.addEventListener("DOMContentLoaded", function()
{
    initLevelSelect();
});

function initLevelSelect()
{
    let userGameData = getUserGameData();

    let isUserGameDataFilled = userGameData.length !== 0;

    let cells = document.getElementsByClassName('level-select-cell');
    for(let i = 0; i < cells.length; i++)
    {
        let cell = cells[i];
        let levelNumber = parseInt(cell.dataset.levelNumber);
        let isTutorial = Boolean(parseInt(cell.dataset.isTutorial));

        cell.classList.toggle('level-select-cell-completed', isUserGameDataFilled && userGameData.length > levelNumber && userGameData[levelNumber])

        let enableCell = false;
        if(levelNumber === 0 || !isTutorial)
        {
            enableCell = true;
        }
        else if(isUserGameDataFilled && userGameData.length >= levelNumber)
        {
            enableCell = userGameData[levelNumber - 1]
        }

        cell.classList.toggle('disabled', !enableCell);
        cell.disabled = !enableCell;
    }

    let isTutorialCompleted;
    if(isUserGameDataFilled && userGameData.length >= numberOfTutorialLevels)
    {
        isTutorialCompleted = userGameData.slice(0, numberOfTutorialLevels).every(v => v === true);
    }
    else
    {
        isTutorialCompleted = false;
    }
    document.getElementById('container-level-select').classList.toggle('hidden', !isTutorialCompleted);
    document.getElementById('tutorial-notice').classList.toggle('hidden', isTutorialCompleted);
}
