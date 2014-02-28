document.addEventListener('DOMContentLoaded', function() {

    var artworks = document.querySelectorAll('.artwork'),
        preview = document.querySelector('.artwork_preview'),
        previewImg = document.querySelector('.artwork_preview #preview'),
        previewShort = document.querySelector('.artwork_preview .description'),
        previewLink = document.querySelector('.artwork_preview .open'),
        filterBar = document.querySelector('.filterBar'),
        filter = ["featured"];

    for (var a in artworks) {
        if (typeof artworks[a] == "object") {
            var element = artworks[a];
            var source = element.querySelector('img').src;
            var paper = element.querySelector('svg');
            var colour = element.dataset.colour;
            maskArtwork(paper, source, colour);         
        }
        filterArtworks();
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
            document.querySelector('.header').classList.add('coloured');
            polygon.animate({ r: 110 }, 300, mina.easeinout);
            // polygonHighlight.animate({ strokeOpacity: 1 }, 400);
            polygonHighlight.attr({strokeOpacity: 1});
        }, function() {
            polygon.animate({ r: 90 }, 20, mina.easeinout);
            // polygonHighlight.animate({ strokeOpacity: 0 }, 200);
            polygonHighlight.attr({strokeOpacity: 0});
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
        document.querySelector('.header').classList.remove('coloured');
    });

    function dismissPreview(event) {
        if (event.target.classList.contains('artwork_preview') || 
            event.target.classList.contains('close') ) {
            event.preventDefault();
            filterBar.classList.remove('hidden');
            preview.style.display = "none";
            document.body.style.backgroundColor = "#fafafa";
            document.querySelector('.header').classList.remove('coloured');
            document.body.classList.remove('overlayed');
        }
    }

    [].forEach.call(document.querySelectorAll('.filterBar button'), function(button) {
        button.addEventListener('click', function() {
            if (button.dataset.filterValue) {
                var filterValues = button.dataset.filterValue.split(", ");
                button.classList.toggle('active');
                document.querySelector('#clearFilterButton').classList.remove('active');
                if (!button.classList.contains("active")) {
                    for (var i=filterValues.length-1; i>=0; i--) {
                        filter.splice(filter.indexOf(filterValues[i]), 1);
                    }
                    if (filter.length === 0)
                        clearFilter();
                } else {
                    for (var i=filterValues.length-1; i>=0; i--) {
                        filter.push(filterValues[i]);
                    }
                }
                console.log("FILTER:", filter);
                filterArtworks();
            }
            else {
                document.querySelector('#clearFilterButton').classList.add('active');
                clearFilter();
            }
        })
    });

    document.getElementById('trigger').addEventListener('click', function(event) {
        event.preventDefault();
        filterBar.classList.toggle('expanded');
        document.body.classList.toggle('overlayed');
    });

    [].forEach.call(document.querySelectorAll('.artwork_container a'), function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            previewImg.src = link.previousSibling.src;
            preview.querySelector('h2.title').innerText = link.title;
            previewShort.innerHTML = link.dataset.description || "";
            previewLink.href = link.href;
            setTimeout(function() {                
                document.body.classList.add('overlayed');
                filterBar.classList.add('hidden');
                preview.style.display = "block";
            }, 200);
        });
    });

    document.querySelector('.artwork_preview').addEventListener('click', dismissPreview);
    document.querySelector('.preview_container .close').addEventListener('click', dismissPreview);

});