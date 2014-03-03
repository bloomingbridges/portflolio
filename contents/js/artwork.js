document.addEventListener('DOMContentLoaded', function() {

    var artworks = document.querySelectorAll('.artwork'),
        preview = document.querySelector('.artwork_preview'),
        previewImg = document.querySelector('.artwork_preview #preview'),
        previewShort = document.querySelector('.artwork_preview .description'),
        previewLink = document.querySelector('.artwork_preview .open'),
        filterBar = document.querySelector('.filterBar'),
        filterButtons = document.querySelectorAll('.filterBar button'),
        filter = ["featured"];

    for (var a in artworks) {
        if (typeof artworks[a] == "object") {
            var element = artworks[a];
            var source = element.querySelector('img').src;
            var paper = element.querySelector('svg');
            var colour = element.dataset.colour;
            maskArtwork(paper, source, colour);         
        }
    }
    
    if (!localStorage.getItem('filter'))
        filter = ["featured"];
    else
        filter = retrievePreviousFilter()

    // console.log("FILTER:", filter);
    filterArtworks();
    updateFilterButtonStates();

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

    function updateFilterButtonStates() {
        if (filter.length > 0) {
            [].forEach.call(filterButtons, function(button) {
                if (button.dataset.filterValue) {
                    var filterValues = button.dataset.filterValue.split(", ")
                      , passed = false;
                    // console.log('###', filterValues);
                    for (var i = filter.length-1; i >= 0; i--) {
                        if (filterValues.indexOf(filter[i]) > -1)
                            passed = true;  
                    }
                    if (passed)
                        button.classList.add('active');      
                }
            });
        } else {
            console.log("blargh");
            filterButtons[0].classList.add('active');
        }
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

    function retrievePreviousFilter() {
        var lastFilter = localStorage.getItem('filter').split(',');
        console.log("Cached filter: ", lastFilter);
        return lastFilter;
    }

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

    [].forEach.call(filterButtons, function(button) {
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
            localStorage.setItem('filter', filter);
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