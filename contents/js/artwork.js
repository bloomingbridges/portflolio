document.addEventListener('DOMContentLoaded', function() {

    var artworks = document.querySelectorAll('.artwork')
      , preview = document.querySelector('.artwork_preview')
      , previewImg = document.querySelector('.artwork_preview #preview')
      , previewShort = document.querySelector('.artwork_preview .description')
      , previewLink = document.querySelector('.artwork_preview .open')
      , filterBar = document.querySelector('.filterBar')
      , filterButtons = document.querySelectorAll('.filterBar button')
      , filter = ["featured"]
      , masks = {}
      , rAfID;

    var States = {
        IDLE: 0
      , EXPANDING: 1
      , FLOATING: 2
      , SPLAT: 3
      , CONTRACTING: 4
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
    FastClick.attach(document.body);
    rAfID = requestAnimationFrame(animatePolygons);



    // Mask ///////////////////////////////////////////////////////////////////

    function Mask(element, mask, shadow) {
        this.element = element;
        this.mask = mask;
        this.shadow = shadow;
        this.original = generatePolygon(); 
        this.path = this.original.slice();
        this.state = 0;
        this.active = false;
        this.mask.setAttribute("d", constructPathString(this.original));
        this.shadow.setAttribute("d", constructPathString(this.original));
        return this;
    }

    Mask.prototype.innerTargets = [[45,45],[45,205],[205,205],[205,45]];
    Mask.prototype.outerTargets = [[5,5],[5,245],[245,245],[245,5]];

    Mask.prototype.setState = function(newState) {
        this.state = newState;
        // console.log("STATE CHANGED TO: " + newState + " { " + this.element.id + " }");
    };

    Mask.prototype.update = function() {
        var pathString, wiggle = false;
        if (this.state > States.IDLE) {
            switch (this.state) {

                case States.EXPANDING:
                    this.path = this.morph(this.path, this.innerTargets);
                    wiggle = new Date();
                    break;

                case States.FLOATING:
                    wiggle = new Date();
                    break;

                case States.SPLAT:
                    this.path = this.morph(this.path, this.outerTargets);
                    this.active = true;
                    break;

                case States.CONTRACTING:
                    if (!this.active) {
                        this.path = this.morph(this.path, this.original);
                    }
                    break;
            }
            pathString = constructPathString(this.path, wiggle);
            this.mask.setAttribute("d", pathString);
            this.shadow.setAttribute("d", pathString);
        }
    };

    Mask.prototype.morph = function(path, target) {
        var p = []
          , vertex
          , targetVertex
          , checksum = 0
          , progress = 0;

        for (var v=path.length-1; v>=0; v--) {
            vertex = path[v];
            targetVertex = target[v];
            checksum += targetVertex[0] + targetVertex[1];
            if (targetVertex[0] > vertex[0]) {
                vertex[0] += (targetVertex[0] - vertex[0]) * 0.1;
            } else {
                vertex[0] -= (vertex[0] - targetVertex[0]) * 0.1;
            }
            if (targetVertex[1] > vertex[1]) {
                vertex[1] += (targetVertex[1] - vertex[1]) * 0.1;
            } else {
                vertex[1] -= (vertex[1] - targetVertex[1]) * 0.1;
            }
            p.push([vertex[0], vertex[1]]);
            progress += vertex[0] + vertex[1];
        }
        if (Math.floor(checksum) === Math.round(progress)) {
            this.advanceState();
        }
        return p.reverse();
    };

    Mask.prototype.advanceState = function() {
        switch (this.state) {
            case States.EXPANDING:
                this.setState(States.FLOATING);
                break;
            case States.CONTRACTING:
                if (!this.active)
                    this.reset();
                break;
        }
    }

    Mask.prototype.reset = function() {
        this.setState(States.IDLE);
        this.path = this.original.slice(0);
        var pathString = constructPathString(this.path);
        this.mask.setAttribute("d", pathString);
        this.shadow.setAttribute("d", pathString);
    };

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

        masks[element.id] = new Mask(element, mask, shadow);

        element.addEventListener("mouseover", function(event) {
            document.body.style.backgroundColor = colour;
            filterBar.style.backgroundColor = colour;
            filterBar.classList.add('coloured');
            document.querySelector('.header').classList.add('coloured');
            masks[element.id].setState(States.EXPANDING);
        });
        element.addEventListener("click", function(event) {
            masks[element.id].setState(States.SPLAT);
        });
        element.addEventListener("mouseleave", function(event) {
            masks[element.id].setState(States.CONTRACTING);
        });

    }

    function animatePolygons() {
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

    function constructPathString(points, noise) {
        var s = "M"
          , point
          , start
          , x
          , y;

        for (var p=0; p<points.length; p++) {
            point = points[p];
            x = point[0];
            y = point[1];
            if (noise) {
                x += (p % 2 == 0) ? (Math.sin(noise/300) * (p+1)) : (Math.cos(noise/300) * (p+1));
                y += (p % 2 == 0) ? (Math.cos(noise/300) * (p+1)) : (Math.sin(noise/300) * (p+1));
            }
            if (p === 0) {
                start = x+","+y;
            }
            s += x+","+y+"L";
        }
        s += start+"Z";
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
        // console.log("Cached filter: ", lastFilter);
        return lastFilter;
    }



    // Event Handlers /////////////////////////////////////////////////////////

    function dismissPreview(event) {
        if (event.target.classList.contains('artwork_preview') || 
            event.target.classList.contains('close') ) {
                event.preventDefault();
                masks[preview.dataset.current].active = false;
                masks[preview.dataset.current].setState(States.CONTRACTING);
                filterBar.classList.remove('hidden');
                preview.style.display = "none";
                preview.scrollTop = 0;
                document.body.style.backgroundColor = "#fafafa";
                filterBar.style.backgroundColor = "rgba(250,250,250,0.6)";
                filterBar.classList.remove('coloured');
                document.querySelector('.header').classList.remove('coloured');
                document.body.classList.remove('overlayed');
        }
    }

    function attachPreviewHandler(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            preview.dataset.current = link.parentNode.id;
            previewImg.src = link.parentNode.dataset.teaser;
            preview.querySelector('h2.title').innerText = link.title;
            previewShort.innerHTML = link.dataset.description || "";
            previewLink.href = link.href;
            setTimeout(function() {                
                document.body.classList.add('overlayed');
                filterBar.classList.add('hidden');
                preview.style.display = "block";
            }, 300);
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
                filterBar.style.backgroundColor = "rgba(250,250,250,0.6)";
                filterBar.classList.remove('coloured');
                document.querySelector('.header').classList.remove('coloured');
            });

});