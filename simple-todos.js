questions = [ 
              {
                  "title": "Question One",
                  "fields": [{
                      "type": "short_text",
                      "question": "This is a test?"
                    }]
                },
                {
                  "title": "Question Two",
                  "fields": [{
                      "type": "short_text",
                      "question": "This is a test?"
                    }]
                },
                {
                  "title": "Question Three",
                  "fields": [{
                      "type": "short_text",
                      "question": "This is a test?"
                    }]
              }
            ];

headers = {'X-API-TOKEN': 'd4400a7768341dafbee86b8628aa26f3'}
url = 'https://api.typeform.io/v0.3/forms'

if (Meteor.isServer) {
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
            console.log(toRetVar)
            return toRetVar;
        },
    });
    Meteor.call("getAllForms");
}


Tasks = new Mongo.Collection("tasks");
 
if (Meteor.isClient) {
  // This code only runs on the client
  
  
  Meteor.call("getForm", function(error, results) {
    if (error) {
        console.log(error);
    } else {
        response_object = JSON.parse(results["content"])["links"][1]["href"];
        console.log(response_object);
        Session.set('form-url', response_object);
        return "We won!";
    }
  });

  Template.leaderboard.player = function(){
      // console.log("TEST:  " + response_object["links"][1]["href"])
      return Session.get('form-url');
  };

  Template.body.helpers({
    tasks: function () {
      // Show newest tasks at the top
      return Tasks.find({}, {sort: {createdAt: -1}});
    },
    form: function() {
      HTTP.call(
        "POST", 
        "https://api.typeform.io/latest/forms", 
        { "headers": 
          {"X-API-TOKEN":"d4400a7768341dafbee86b8628aa26f3"}
      });
    }
  });

  Template.body.events({
      "submit .new-task": function (event) {
        // Prevent default browser form submit
        event.preventDefault();
        console.log(event);
        // Get value from form element
        var text = event.target.text.value;
   
        // Insert a task into the collection
        Tasks.insert({
          text: text,
          createdAt: new Date() // current time
        });
   
        // Clear form
        event.target.text.value = "";
      }


    });

  Template.task.events({
      "click .toggle-checked": function () {
        // Set the checked property to the opposite of its current value
        Tasks.update(this._id, {
          $set: {checked: ! this.checked}
        });
      },
      "click .delete": function () {
        Tasks.remove(this._id);
      }
    });
}

