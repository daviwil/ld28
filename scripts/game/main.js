define(['kinetic', 'soundjs', 'easeljs'], function(Kinetic, SoundJS) {
    return {
        
        init: function() {
            // var stage = new Kinetic.Stage({
            //     container: 'gameDiv',
            //     width: 800,
            //     height: 600
            // });

            // var layer = new Kinetic.Layer();

            // var rect = new Kinetic.Rect({
            //     x: 139,
            //     y: 15,
            //     width: 100,
            //     height: 50,
            //     fill: 'green',
            //     stroke: 'black',
            //     strokeWidth: 4
            // });

            // var poly = new Kinetic.Polygon({
            //     points: [73, 192, 73, 160, 340, 23, 500, 109, 499, 139, 342, 93],
            //     fill: '#00D2FF',
            //     stroke: 'black',
            //     strokeWidth: 5
            // });

            // add the shape to the layer
            // layer.add(rect);

            // add the shape to the layer
            // layer.add(poly);

            // add the layer to the stage
            // stage.add(layer);

            var canvasElement = document.getElementById("gameCanvas");
            var stage = new createjs.Stage(canvasElement);

            // Create a new Text object:
            var text = new createjs.Text("Hello World!", "36px Arial", "#777");

            // add the text as a child of the stage. This means it will be drawn any time the stage is updated
            // and that its transformations will be relative to the stage coordinates:
            stage.addChild(text);

            // position the text on screen, relative to the stage coordinates:
            text.x = 360;
            text.y = 200;

            // call update on the stage to make it render the current display list to the canvas:
            stage.update();
        }

    }
});
