window.onload = function() {

    var artworks = document.querySelectorAll('.artwork');
    for (var a in artworks) {
        var element = artworks[a];
        var source = element.querySelector('img').src;
        var paper = element.querySelector('svg');
        var colour = element.dataset.colour;
        maskArtwork(paper, source, colour);
    }

    function maskArtwork(element, source, colour) {

        var s = Snap(element);
        var image = s.image(source, 0, 0, 500, 500);
        var polygon = s.circle(250, 250, 180);
        var polygonHighlight = s.circle(250,250,220);
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
            polygon.animate({ r: 220 }, 700, mina.elastic);
            document.body.style.backgroundColor = colour;
            window.setTimeout(function() {
                polygonHighlight.animate({ strokeOpacity: 1 }, 300);
            }, 300);
            
        }, function() {
            polygon.animate({ r: 180 }, 300, mina.easeinout);
            polygonHighlight.animate({ strokeOpacity: 0 }, 30);
            document.body.style.backgroundColor = '#fafafa';
        });

    }

}