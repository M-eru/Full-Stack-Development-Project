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

// Display selected file name
$(".custom-file-input").on("change", function () {
    var fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
})


// Use fetch to call post route /video/upload
$('#posterUpload').on('change', function () {
    console.log("Hello")
    let formdata = new FormData();
    let image = $("#posterUpload")[0].files[0];
    formdata.append('posterUpload', image);
    fetch('/badge/upload', {
        method: 'POST',
        body: formdata
    })
        .then(res => res.json())
        .then((data) => {
            $('#badgeImage').attr('src', data.file);
            $('#posterURL').attr('value', data.file); // sets posterURL hidden field
            if (data.err) {
                $('#posterErr').show();
                $('#posterErr').text(data.err.message);
            }
            else {
                $('#posterErr').hide();
            }
        })
});
