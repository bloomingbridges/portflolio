document.addEventListener('DOMContentLoaded', function() {

    var artworks = document.querySelectorAll('.artwork'),
        preview = document.querySelector('.artwork_preview'),
        previewImg = document.querySelector('.artwork_preview #preview'),
        previewShort = document.querySelector('.artwork_preview .description'),
        previewLink = document.querySelector('.artwork_preview .open'),
        filterBar = document.querySelector('.filterBar'),
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
            document.body.style.backgroundColor = colour;
            polygon.animate({ r: 110 }, 300, mina.easeinout);
            polygonHighlight.animate({ strokeOpacity: 1 }, 400);
        }, function() {
            polygonHighlight.animate({ strokeOpacity: 0 }, 200);
            polygon.animate({ r: 90 }, 200, mina.easeinout);
        });

    }

    function filterArtworks() {
        [].forEach.call(artworks, function(artwork) {
            var passedTest;
            for (var f=0; f<filter.length; f++) {
                if (artwork.dataset.category.indexOf(filter[f]) > -1)
                    passedTest = true;
                if (!passedTest)
                    artwork.classList.add('filtered');
                else
                    artwork.classList.remove('filtered');
            }
        });
    }

    function clearFilter() {
        filter = [];
        [].forEach.call(document.querySelectorAll('.artwork'), function(artwork) {
            artwork.classList.remove('filtered');
        });
        [].forEach.call(document.querySelectorAll('.filterBar button'), function(button) {
            button.classList.remove('active');
        });
        document.querySelector('#clearFilterButton').classList.add('active');
    }

    document.querySelector(".header").addEventListener('mouseover', function() {
        document.body.style.backgroundColor = '#fafafa';
    });

    [].forEach.call(document.querySelectorAll('.filterBar button'), function(button) {
        button.addEventListener('click', function() {
            if (button.dataset.filterValue) {
                button.classList.toggle('active');
                document.querySelector('#clearFilterButton').classList.remove('active');
                if (!button.classList.contains("active")) {
                    filter.splice(filter.indexOf(button.dataset.filterValue), 1);
                    if (filter.length === 0)
                        clearFilter();
                } else {
                    filter.push(button.dataset.filterValue);
                }
                console.log(filter);
                filterArtworks();
            }
            else {
                document.querySelector('#clearFilterButton').classList.add('active');
                clearFilter();
            }
        })
    });

    [].forEach.call(document.querySelectorAll('.artwork_container a'), function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            previewImg.src = link.previousSibling.src;
            preview.querySelector('h2.title').innerText = link.title;
            previewShort.innerText = link.title;
            previewLink.href = link.href;
            setTimeout(function() {                
                filterBar.classList.add('hidden');
                preview.style.display = "block";
            }, 200);
        });
    });

    document.querySelector('.artwork_preview .close').addEventListener('click', function(event) {
        filterBar.classList.remove('hidden');
        preview.style.display = "none";
    });

});