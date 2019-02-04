// Initialize Firebase
var config = {
    apiKey: "AIzaSyDUlv4KEAVQ2qOKlRykDWV5QbSrZnLP_FY",
    authDomain: "train-scheduler-a7bc1.firebaseapp.com",
    databaseURL: "https://train-scheduler-a7bc1.firebaseio.com",
    projectId: "train-scheduler-a7bc1",
    storageBucket: "train-scheduler-a7bc1.appspot.com",
    messagingSenderId: "941625472450"
};

firebase.initializeApp(config);

var database = firebase.database();
var trainsRef = database.ref("trains");

class Train {
    constructor(snapshot){
        this.key = snapshot.key
        this.name = snapshot.val().name;
        this.destination = snapshot.val().destination;
        this.firstTrainTime = snapshot.val().firstTrainTime;
        this.frequency = parseInt(snapshot.val().frequency);
        this.timeTilNext = this.getTimeTilNext();
    }

    getTimeTilNext(){
        let first = moment(this.firstTrainTime, "HH:mm");
        let now = moment();
        let duration = moment.duration(now.diff(first));
        let minutes = duration.asMinutes();
        let remainder = minutes % this.frequency;
        let timeTil = this.frequency - remainder;

        return Math.floor(timeTil);
    }

    createRow(){
        let row = $("<tr>").attr('id', this.key);
        let editButton = $("<button>").addClass("edit-button").html('<i class="fa fa-edit"></i>');
        let deleteButton = $("<button>").addClass("delete-button").html('<i class="fa fa-trash"></i>');

        row.append($("<td>").html(this.name));
        row.append($("<td>").html(this.destination));
        row.append($("<td>").html(this.frequency));
        row.append($("<td>").html(moment().add(this.timeTilNext, "minutes").format("HH:mm")));
        row.append($("<td>").html(this.timeTilNext));
        row.append($("<td>").html(editButton));
        row.append($("<td>").html(deleteButton));

        return row
    }
}

const updateTrainTable = () => {
    $("#table-body").html("");
    trainsRef.on("child_added", function(snapshot) {
        $("#table-body").append(new Train(snapshot).createRow());
    });
}

updateTrainTable();

setInterval(function(){
    updateTrainTable();
}, 60000);


function addTrain(event){
    event.preventDefault();

    let name = $('#name-input').val();
    let destination = $('#destination-input').val();
    let firstTrainTime = $('#first-time-input').val();
    let frequency = $('#frequency-input').val();

    trainsRef.push({
        name,
        destination,
        firstTrainTime,
        frequency
    })
}

function editTrain(event){
    event.preventDefault();

    let name = $('#name-edit').val();
    let destination = $('#destination-edit').val();
    let firstTrainTime = $('#first-time-edit').val();
    let frequency = $('#frequency-edit').val();

    trainsRef.child(event.data.key).update({
        name,
        destination,
        firstTrainTime,
        frequency
    })
    updateTrainTable();
}

function openTrainEditor(event){
    event.preventDefault();
    let trainRow = $(this).closest("tr");
    let trainKey = trainRow.attr("id");
    let cacheOldRow = trainRow.html();
    trainRow.html("");
    trainsRef.child(trainKey).once("value", function(trainSnap){
        let trainData = trainSnap.val();

        let nameInput = `<label for="name-edit">Train Name:</label><input class="form-control" id="name-edit" value=${trainData.name} type="text">`
        let destinationInput = `<label for="destination-edit">Destination:</label><input class="form-control" id="destination-edit" value=${trainData.destination} type="text">`
        let firstTrainInput = `<label for="first-time-edit">First Train:</label><input class="form-control" id="first-time-edit" value=${trainData.firstTrainTime} type="time">`
        let frequencyInput = `<label for="frequency-edit">Frequency:</label><input class="form-control" id="frequency-edit" value=${trainData.frequency} type="number">`
        let editSubmitButton = $("<button>").addClass("submit-edit-button").html('<i class="fa fa-check-square"></i>');
        let cancelButton = $("<button>").addClass("cancel-button").html('<i class="fa fa-ban"></i>');
        
        trainRow.append($("<td>").html(nameInput));
        trainRow.append($("<td>").html(destinationInput));
        trainRow.append($("<td>").html(firstTrainInput));
        trainRow.append($("<td>").html(frequencyInput));
        trainRow.append($("<td>").html(""));
        trainRow.append($("<td>").html(editSubmitButton));
        trainRow.append($("<td>").html(cancelButton));
        editSubmitButton.click({key: trainKey}, editTrain);
        cancelButton.click(function(){
            trainRow.html(cacheOldRow);
        })
    });
}

function deleteTrain(event){
    if(confirm("Are you sure you want to permanently delete this train?")){
        console.log("confirmed!!!! Delete that shit!");
        let trainRow = $(this).closest("tr");
        let trainKey = trainRow.attr("id");
        trainRow.remove();
        trainsRef.child(trainKey).remove();
    }else{
        return false;
    }
}

$("#add-train").on("click", addTrain);
$(document).on("click", ".edit-button", openTrainEditor);
$(document).on("click", ".delete-button", deleteTrain);
