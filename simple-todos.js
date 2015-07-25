headers = {'X-API-TOKEN': 'd4400a7768341dafbee86b8628aa26f3'}
url = 'https://api.typeform.io/v0.3/forms'

Users = new Mongo.Collection("users");
NextQuestions = new Mongo.Collection("questions");


if (Meteor.isServer) {
  Router.route('/', function () {
    this.render('', {
      data: function () { 
        // return Items.findOne({_id: this.params._id}); 
      }
    });
  });

  (function() { 
    NextQuestions.insert({user_id: 1, next_question: 0});
    Users.insert({user_id: 1, questionNumber: 0, question_answer: null});
  })();

  NextQuestions.insert({user_id: 1, next_question: 0});
  Users.insert({user_id: 1, questionNumber: 0, question_answer: null});


  Router.route('/webhooks/typeform/:timstamp', {where: 'server'})
    .post(function () {
      var msg = this.request.body;
      var answer = msg.answers[0].data.value;
      var user = decodeURIComponent(this.params.usercode);

      // console.log(msg.answers);
      // console.log("ANSWER: " + answer.label);
      var i = NextQuestions.findOne({user_id: 1}).next_question;

      if (answer.label === "Take Two Steps Back"){
       var i = i-2;
      } else if (answer.label === "Take One Step Back"){
       var i = i-1;
      } else if (answer.label === "Stay Here"){
       var i = i +  0;
      } else if (answer.label === "Move Forward"){
       var i = i + 1;
      } else if (answer.label === "Take Two Steps Forward"){
       var i = i + 2;
      }

      console.log("NEXT Q: " + i);
      NextQuestions.update({user_id: 1}, {user_id: 1, next_question: i});
      Users.update({user_id: 1}, {user_id: 1, questionNumber: (Math.floor(Math.random() * (200 - 0 + 1)) + 0), question_answer: null});
      // This is where we change the question number
      // Tasks.update(this._id, {
      //   $set: {checked: ! this.checked}
      // });

      // console.log("MESSAGE: " + msg);
      // console.log("ANSWERS: " + answer);
      // console.log("USER: " + user);
      // console.log(_.keys(msg));
      // console.log(this.params);
      // Users.update({user_id:0},{user_id: 1, question_number: (Math.floor(Math.random() * (200 - 0 + 1)) + 0)} );
      this.response.end('Thank you! Please come again!\n');
    });

    Meteor.methods({
        getAllForms: function () {
            this.unblock();
            var toRetVar =  questions.map(function(question) {
              var request = Meteor.http.call('POST',url, 
                {
                  data: question,
                  headers: headers
                }
              );
              return request.data.links[1].href;
            });
            // console.log(toRetVar)
            return toRetVar;
        },
    });
}

 
if (Meteor.isClient) {
  Router.route('/', function () {
    this.render('', {
      data: function () { 
        // return Items.findOne({_id: this.params._id}); 
      }
    });
  });
          

  // Assign a user_id
  (function() { 
    var fingerprint = new Fingerprint().get();
    console.log(fingerprint);
    Session.set("startTime", Date.now() / 1000);
    Session.set("timeBetween", 0);
    // if (Users.findOne({user_id: 1}) === undefined) {
    // NextQuestions.update({user_id: 1}, {user_id: 1, next_question: 0});
      // Users.insert({user_id: 1, questionNumber: 0, question_answer: null});
    // }
  }());

  var user = Users.find({user_id: 1});

  var handle = user.observe({
    added: function (user) { console.log("ADDED"); }, // run when user is added
    changed: function (user) {
      console.log("CHANGED");
      var i = Session.get("questionNumber");

      var next_question = NextQuestions.findOne({user_id: 1}).next_question;
      if (next_question < 0) {
        next_question = 0;
      } else if (next_question > 9) {
        next_question = 9;
      }

      console.log("EYE: " + i);
      Session.set("currentHref", Session.get("questionUrls")[next_question]);
      Session.set("timeBetween", Date.now() / 1000 - Session.get("startTime"))
      Session.set("startTime", Date.now() / 1000);
      Session.set("questionNumber", i+1);
    }, // run when post is changed
    removed: function (user) { console.log("REMOVED"); } // run when post is removed
  });

  Meteor.call("getAllForms", function(error, results) {
    console.log(error);
    if (error) {
        console.log(error);
    } else {
        Session.set('questionUrls', results);
        Session.set("questionNumber", 0);
        Session.set("currentHref", results[0]);
        return "BOO YA!";
    }
  });

  Template.typeForm.helpers({
    currentHref: function() {
      // var tb = Session.get("timeBetween");
      // Session.set("timeBetween", (Date.now() / 1000 - tb) );
      // Session.set('timeBetween', Session.get("timeBetween") - Date.now() / 1000);
      return Session.get('currentHref');
    },
    startTime: function() {
      return Session.get("startTime");
    },
    timeBetween: function() {
      return Session.get("timeBetween");
    }
  });

}

