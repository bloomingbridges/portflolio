window.onload = function() {

    var artworks = document.querySelectorAll('.artwork');
    for (var a in artworks) {
        if (typeof artworks[a] == "object") {
            var element = artworks[a];
            var source = element.querySelector('img').src;
            var paper = element.querySelector('svg');
            var colour = element.dataset.colour;
            maskArtwork(paper, source, colour);         
        }
    }

    function maskArtwork(element, source, colour) {

        var s = Snap(element);
        var image = s.image(source, 0, 0, 250, 250);
        var polygon = s.circle(125, 125, 90);
        var polygonHighlight = s.circle(125,125,110);
        polygon.attr({ 
            fill: "#fff"
        });
        polygonHighlight.attr({
            fill: "magenta",
            fillOpacity: 0,
            stroke: "white",
            strokeWidth: 5,
            strokeOpacity: 0
        });
        image.attr({
            mask: polygon
        });
        polygonHighlight.hover(function() {
            polygon.animate({ r: 110 }, 300, mina.easeinout);
            polygonHighlight.animate({ strokeOpacity: 1 }, 400);
            document.body.style.backgroundColor = colour;
        }, function() {
            window.setTimeout(function() {
                polygon.animate({ r: 90 }, 200, mina.easeinout);
                polygonHighlight.animate({ strokeOpacity: 0 }, 200);
                document.body.style.backgroundColor = '#fafafa';
            }, 30);
        });

    }

}