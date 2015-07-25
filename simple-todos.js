questions = [ 

              {
                  "title": "Question One",
                  "webhook_submit_url": "http://http://typeform.meteor.com/webhooks/typeform/12345",
                  "fields": [{
                      "type": "short_text",
                      "question": "This is a test #1?"
                    }]
                },
                {
                  "title": "Question Two",
                  "fields": [{
                      "type": "short_text",
                      "question": "This is a test #2?"
                    }]
                },
                {
                  "title": "Question Three",
                  "fields": [{
                      "type": "short_text",
                      "question": "This is a test #3?"
                    }]
              }
            ];

headers = {'X-API-TOKEN': 'd4400a7768341dafbee86b8628aa26f3'}
url = 'https://api.typeform.io/v0.3/forms'

if (Meteor.isServer) {
  Router.route('/webhooks/typeform/:usercode', {where: 'server'})
    .post(function () {
      var msg = this.request.body;
      var answer = msg.answers[0].data.value;
      var user = decodeURIComponent(this.params.usercode);

      // This is where we change the question number
      // Tasks.update(this._id, {
      //   $set: {checked: ! this.checked}
      // });

      // console.log("MESSAGE: " + msg);
      // console.log("ANSWERS: " + answer);
      // console.log("USER: " + user);
      // console.log(_.keys(msg));
      // console.log(this.params);
      this.response.end('Thank you! Please come again!\n');
    });

    Meteor.methods({
        getForm: function () {
            this.unblock();
            var request = Meteor.http.call('POST',url, 
              {
                data: questions[0],
                headers: headers
              }
            );
            return request;
        },
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
    var super_question_url_array = Meteor.call("getAllForms");
    // console.log("WHAT IS THIS? " + super_question_url_array);
}


Tasks = new Mongo.Collection("tasks");
Users = new Mongo.Collection("users");
 
if (Meteor.isClient) {
  // This code only runs on the client
  (function() { 
    Users.insert({user_id: 0, question_number: 0, question_answer: null});
  }());

  var user = Users.find({user_id: 0});

  var handle = user.observe({
    added: function (user) { console.log("ADDED"); }, // run when user is added
    changed: function (user) {
      console.log("CHANGED");
      Session.set("question-number", Users.findOne({user_id:0}).question_number);
      Template.leaderboard.player(i);
    }, // run when post is changed
    removed: function (user) { console.log("REMOVED"); } // run when post is removed
  });

  // Meteor.call("getForm", function(error, results) {
  //   if (error) {
  //       console.log(error);
  //   } else {
  //       response_object = JSON.parse(results["content"])["links"][1]["href"];
  //       // console.log(response_object);
  //       Session.set('form-url', response_object);
  //       return "We won!";
  //   }
  // });  
  Meteor.call("getAllForms", function(error, results) {
    console.log(error);
    if (error) {
        console.log(error);
    } else {
        // console.log(response_object);
        Session.set('question-urls', results);
        // console.log("RESULTS HERE: " + results);
        return "We won!";
    }
  });

  Template.leaderboard.helpers({
    player: function() {
      return Session.get('question-number');
    }
  });

  // Template.leaderboard.player = function(i){
  //     // console.log("TEST:  " + response_object["links"][1]["href"])
  //   if (i == undefined) { var i = 0; }
  //   console.log(Session.get('question-urls'));
  //   if(Session.get("question-urls") !== undefined) {
  //     return Session.get('question-urls')[i];
  //   }
  // };

  // Template.body.helpers({
  //   tasks: function () {
  //     // Show newest tasks at the top
  //     return Tasks.find({}, {sort: {createdAt: -1}});
  //   },
  //   form: function() {
  //     HTTP.call(
  //       "POST", 
  //       "https://api.typeform.io/latest/forms", 
  //       { "headers": 
  //         {"X-API-TOKEN":"d4400a7768341dafbee86b8628aa26f3"}
  //     });
  //   }
  // });

  // Template.body.events({
  //     "submit .new-task": function (event) {
  //       // Prevent default browser form submit
  //       event.preventDefault();
  //       // console.log(event);
  //       // Get value from form element
  //       var text = event.target.text.value;
   
  //       // Insert a task into the collection
  //       Tasks.insert({
  //         text: text,
  //         createdAt: new Date() // current time
  //       });
   
  //       // Clear form
  //       event.target.text.value = "";
  //     }


  //   });

  // Template.task.events({
  //     "click .toggle-checked": function () {
  //       // Set the checked property to the opposite of its current value
  //       Tasks.update(this._id, {
  //         $set: {checked: ! this.checked}
  //       });
  //     },
  //     "click .delete": function () {
  //       Tasks.remove(this._id);
  //     }
  //   });
}

