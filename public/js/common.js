function initialiseName() {
    let name = $('#cardName').val();
    let nameArr = [];
    let initName = '';
    if (name) {
        nameArr = name.trim().split(' ');
        for (let i = 0; i < nameArr.length; i++) {
            initName += nameArr[i].charAt(0).toUpperCase() + nameArr[i].slice(1)
                + (i == nameArr.length - 1 ? '' : ' ');
        }
        $('#title').val(initName);
    }
}