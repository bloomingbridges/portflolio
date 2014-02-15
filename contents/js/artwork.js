window.onload = function() {

    var artworks = document.querySelectorAll('.artwork'),
        filter = [];

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
            polygonHighlight.animate({ strokeOpacity: 0 }, 200);
            polygon.animate({ r: 90 }, 200, mina.easeinout);
        });

    }

    function filterArtwork() {

    }

    document.querySelector(".header").addEventListener('mouseover', function() {
        document.body.style.backgroundColor = '#fafafa';
    });

    // var iso = new Isotope(".artwork_container", {
    //     itemSelector: ".artwork",
    //     // getSortData: {
    //     //     category: '[data-category]'
    //     // },
    //     containerStyle: null,
    //     transitionDuration: 0,
    //     hiddenStyle: {
    //         opacity: 0.5
    //     },
    //     visibleStyle: {
    //         opacity: 1
    //     },
    //     layoutMode: "fitRows"
    // });

    [].forEach.call(document.querySelectorAll('.filterBar button'), function(button) {
        button.addEventListener('click', function() {
            if (button.dataset.filterValue) {
                button.classList.toggle('active');
                filter.push(button.dataset.filterValue);
                filterArtwork();
            }
            else {
                filter = [];
                [].forEach.call(document.querySelectorAll('.artwork'), function(artwork) {
                    artwork.classList.remove('filtered');
                });
            }
        })
    })

}