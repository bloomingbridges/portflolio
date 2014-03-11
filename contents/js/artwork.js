document.addEventListener('DOMContentLoaded', function() {

    var artworks = document.querySelectorAll('.artwork'),
        preview = document.querySelector('.artwork_preview'),
        previewImg = document.querySelector('.artwork_preview #preview'),
        previewShort = document.querySelector('.artwork_preview .description'),
        previewLink = document.querySelector('.artwork_preview .open'),
        filterBar = document.querySelector('.filterBar'),
        filterButtons = document.querySelectorAll('.filterBar button'),
        filter = ["featured"],
        masks = {},
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
            var colour = artwork.dataset.colour;
            maskArtwork(artwork, source, colour);         
        }
    }
    filterArtworks();
    updateFilterButtonStates();
    rAfID = requestAnimationFrame(animatePolygons);



    // Masking ////////////////////////////////////////////////////////////////

    function Mask(element, mask, shadow, path) {
        this.element = element;
        this.mask = mask;
        this.shadow = shadow;
        this.original = this.path = path; 
        this.state = 0;
        this.mask.setAttribute("d", constructPathString(this.original));
        this.shadow.setAttribute("d", constructPathString(this.original));
        return this;
    }

    Mask.prototype.setState = function(newState) {
        this.state = newState;
        // console.log("STATE CHANGED TO: " + newState + " { " + this.element.id + " }");
    }

    Mask.prototype.update = function() {
        if (this.state > States.IDLE) {
            switch (this.state) {

                case States.EXPANDING:
                    for (var v=this.path.length-1; v>=0; v--) {
                        var vertex = this.path[v];
                        vertex[0] += (Math.random() - 0.5) * 5.0;
                        vertex[1] += (Math.random() - 0.5) * 5.0;
                        this.path[v] = vertex;
                    }
                    var pathString = constructPathString(this.path);
                    this.mask.setAttribute("d", pathString);
                    this.shadow.setAttribute("d", pathString);
                    break;

                case States.CONTRACTING:
                    this.state = States.IDLE;
                    break;
            }

        }
    }

    function generatePolygon() {
        var points = []
          , vertices = 4;
        for (var p=0; p<vertices; p++) {
            var offsetX = (p>1) ? 175 : 75
              , offsetY = (p>0 && p<3) ? 175 : 75
              , angle   = Math.random() * (Math.PI * 2)
              , radius  = Math.floor(Math.random() * 30)
              , x       = Math.floor( (offsetX) + (radius * Math.cos(angle)) )
              , y       = Math.floor( (offsetY) + (radius * Math.sin(angle)) );
            points.push([x,y]);
        }
        return points;
    }

    function maskArtwork(element, source, colour) {

        var mask = element.querySelector('svg mask path');
        var shadow = element.querySelector('svg path.shadow');

        masks[element.id] = new Mask(element, mask, shadow, generatePolygon());
        // element.dataset.state = States.IDLE;
        element.addEventListener("mouseover", function(event) {
            document.body.style.backgroundColor = colour;
            document.querySelector('.header').classList.add('coloured');
            masks[element.id].setState(States.EXPANDING);
        });
        element.addEventListener("mouseleave", function(event) {
            masks[element.id].setState(States.CONTRACTING);
        });

    }

    function animatePolygons() {
        // loop through masks
        for (m in masks) {
            masks[m].update();
        }
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
            } else { break; }

        }

        // console.log(path);
        return path;
    }

    function constructPathString(points) {
        var s = "M";
        for (var p=0; p<points.length; p++) {
            s += points[p].toString()+"L";
        }
        s += points[0].toString()+"Z";
        return s;
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