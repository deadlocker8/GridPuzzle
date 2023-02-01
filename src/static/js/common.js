function getUserGameData()
{
    let userGameData = window.localStorage.getItem('userGameData');
    if(userGameData == null)
    {
        return []
    }

    return JSON.parse(userGameData);
}