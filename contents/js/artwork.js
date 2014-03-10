document.addEventListener('DOMContentLoaded', function() {

    var artworks = document.querySelectorAll('.artwork'),
        preview = document.querySelector('.artwork_preview'),
        previewImg = document.querySelector('.artwork_preview #preview'),
        previewShort = document.querySelector('.artwork_preview .description'),
        previewLink = document.querySelector('.artwork_preview .open'),
        filterBar = document.querySelector('.filterBar'),
        filterButtons = document.querySelectorAll('.filterBar button'),
        filter = ["featured"],
        rAfID;

    var States = {
        IDLE: 0,
        EXPANDING: 1,
        FLOATING: 2,
        CONTRACTING: 3
    };



    // Caching ////////////////////////////////////////////////////////////////

    if (!localStorage.getItem('filter'))
        filter = ["featured"];
    else
        filter = retrievePreviousFilter()



    // Initialisation /////////////////////////////////////////////////////////

    for (var a in artworks) {
        if (typeof artworks[a] == "object") {
            var artwork = artworks[a];
            var source = artwork.dataset.teaser;
            var paper = artwork.querySelector('svg');
            var colour = artwork.dataset.colour;
            maskArtwork(paper, source, colour);         
        }
    }
    filterArtworks();
    updateFilterButtonStates();
    rAfID = requestAnimationFrame(animatePolygons);



    // Masking ////////////////////////////////////////////////////////////////

    function generatePolygon() {
        var points = []
          , vertices = 4
          , s = "M";

        for (var p=0; p<vertices; p++) {
            var offsetX = (p>1) ? 175 : 75
              , offsetY = (p>0 && p<3) ? 175 : 75
              , angle   = Math.random() * (Math.PI * 2)
              , radius  = Math.floor(Math.random() * 30)
              , x       = Math.floor( (offsetX) + (radius * Math.cos(angle)) )
              , y       = Math.floor( (offsetY) + (radius * Math.sin(angle)) )
              , point   = [x,y].toString();
            points.push(point);
            s += point+"L";
        }
        s += points[0]+"Z";
        // console.log(s);
        return s;
    }

    function maskArtwork(element, source, colour) {

        var polygon = generatePolygon();
        var mask = element.querySelector('svg mask path');
        mask.setAttribute("d", polygon);
        element.dataset.state = States.IDLE;
        element.addEventListener("mouseover", function(event) {
            document.body.style.backgroundColor = colour;
            document.querySelector('.header').classList.add('coloured');
            element.dataset["state"] = States.EXPANDING;
        });
        element.addEventListener("mouseleave", function(event) {
            element.dataset["state"] = States.CONTRACTING;
        });

    }

    function animatePolygons() {
        [].forEach.call(artworks, function(artwork) {
            var element = artwork.querySelector('svg')
              , state = element.dataset.state;
            if (state > States.IDLE) {
                var mask = element.querySelector('path');
                switch (parseInt(state)) {

                    case States.EXPANDING:
                        if (mask) {
                            var path = parsePathString(mask.getAttribute('d'));
                            element.dataset.state = 0;
                            // mask.setAttribute("d", generatePolygon());
                        }
                        break;

                    case States.CONTRACTING:
                        element.dataset.state = States.IDLE;
                        break;
                }

            }
        });
        rAfID = requestAnimationFrame(animatePolygons);
    }

    function parsePathString(string) {
        var path = []
          , runner = 1
          , stop = 0;

        // console.log("About to parse:", string);

        while (true) {
            var x = y = 0;

            stop = string.indexOf(",", runner);
            x = parseFloat(string.substring(runner, stop));
            runner = stop + 1;

            stop = parseFloat(string.indexOf("L", runner));

            if (stop !== -1) {
                y = parseFloat(string.substring(runner, stop));
                path.push([x,y]);
                runner = stop + 1;
            } else {
                break;
            }

        }

        // console.log(path);
        return path;
    }



    // Filtering //////////////////////////////////////////////////////////////

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


    function retrievePreviousFilter() {
        var lastFilter = localStorage.getItem('filter').split(',');
        console.log("Cached filter: ", lastFilter);
        return lastFilter;
    }



    // Event Handlers /////////////////////////////////////////////////////////

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

    function attachPreviewHandler(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            previewImg.src = link.parentNode.dataset.teaser;
            preview.querySelector('h2.title').innerText = link.title;
            previewShort.innerHTML = link.dataset.description || "";
            previewLink.href = link.href;
            setTimeout(function() {                
                document.body.classList.add('overlayed');
                filterBar.classList.add('hidden');
                preview.style.display = "block";
            }, 200);
        });
    }

    function onFilterButtonPushed(event) {
        var button = event.target;
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
    }



    // Attaching Event Handlers ///////////////////////////////////////////////

    [].forEach.call(filterButtons, function(button) {
        button.addEventListener('click', onFilterButtonPushed);
    });

    [].forEach.call(document.querySelectorAll('.artwork_container a'), attachPreviewHandler);

    document.querySelector('.artwork_preview')
            .addEventListener('click', dismissPreview);

    document.querySelector('.preview_container .close')
            .addEventListener('click', dismissPreview);



    // Small Enhancements /////////////////////////////////////////////////////

    document.getElementById('trigger')
            .addEventListener('click', function(event) {
                event.preventDefault();
                filterBar.classList.toggle('expanded');
                document.body.classList.toggle('overlayed');
            });
    
    document.querySelector(".header")
            .addEventListener('mouseover', function() {
                document.body.style.backgroundColor = '#fafafa';
                document.querySelector('.header').classList.remove('coloured');
            });

});