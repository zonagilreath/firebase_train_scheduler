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

        row.append($("<td>").html(this.name));
        row.append($("<td>").html(this.destination));
        row.append($("<td>").html(this.frequency));
        row.append($("<td>").html(moment().add(this.timeTilNext, "minutes").format("HH:mm")));
        row.append($("<td>").html(this.timeTilNext));

        return row
    }
}

trainsRef.on("child_added", function(snapshot) {
    $("#table-body").append(new Train(snapshot).createRow());
});

function addTrain(event){
    event.preventDefault()

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

$("#add-train").on("click", addTrain);