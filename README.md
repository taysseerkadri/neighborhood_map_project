## Neighborhood Map Project by Taysseer Kadri

### Introduction
This project is my submission for the Neighborhood Map Project for the Udacity Full Stack Developer Program.

In this project, you can explore a stylized map of Digbeth, Birmingham with a filterable list of restaurants in the area.

### How to Use
Simply load the index.html file in your favorite web browser and play with the map!

For any questions, email taysseer.kadri@gmail.com

## More Info

### Model
20 Restaurant entries are retrieved from [Zomato](https://www.zomato.com) asynchronously via the Zomato API. Once the objects are retrieved, they are loaded into the a Knockout.js based ViewModel to be handeled into the View, and the initMap() function is called to render the map. The jQuery ajax method is utilized in this instance:

> script.js
```javascript
$.ajax({
    url: zomatoCall,
    dataType: 'json',
    success: function(data){
        restaurants = data.restaurants;
    },
    error: function (jqXHR, exception){
        var msg = "<p> jqXHR: " + jqXHR.responseText + "</p>" +
            "<p> Uncaught exception: " + exception + "</p>";
        $('#errorMsg').html(msg);
    },
    complete: function () {
        var viewModel = new ViewModel();
        ko.applyBindings(viewModel);
        viewModel.init();
        initMap();
    }
});
```



Maps are provided and loaded asynchronously via Google Maps API





This single-page application utilizes Bootstrap 3 and jQuery to make the app mobile friendly.

#### Mobile View - Filter results into a dropdown list:

![alt text](https://i.imgur.com/uM93EaU.png)

#### Desktop View - Filter results into a list of buttons:

![alt text](https://i.imgur.com/rOmpVk3.png)
