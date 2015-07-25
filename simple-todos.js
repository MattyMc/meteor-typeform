Tasks = new Mongo.Collection("tasks");
 
if (Meteor.isClient) {








  // This code only runs on the client
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