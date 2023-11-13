$("#search").on("click", function () {
    const genreArtistEvent = document.querySelector('#event').value;
    const city = document.querySelector('#city').value;

    if (genreArtistEvent.length == 0) {
        // If genreArtstEvent is empter, alert. Will not alert that both are empty if they are, just the first one.
        $("#card-container").empty();
        $("#displayError").removeClass("d-none");
        $("#displayError").text("Search term cannot be empty. Please enter a search term.");
    }
    else if (city.length == 0) {
        // If genreArtistEven isn't empty and city is empty it will notify user that the city is empty / can't be.
        $("#card-container").empty();
        $("#displayError").removeClass("d-none");
        $("#displayError").text("City cannot be empty. Please enter a city");
    }
    else {
        $("#displayError").addClass("d-none");
        $("#card-container").empty();
        $.ajax({
            type: "GET",
            url: `https://app.ticketmaster.com/discovery/v2/events.json?apikey=D7vEv0uy1A4ZVSByA6KbKX6Yk0EVAQG3&classificationName=${genreArtistEvent}&city=${city}&sort=date,asc`,
            async: true,
            dataType: "json",
            success: function (json) {
                if (json?._embedded?.events?.length !== undefined) {

                    $("#card-container").append(`<h1 class="pt-4">${json._embedded.events.length} events found.</h1>`)
                    console.log(json._embedded.events.length);

                    json._embedded.events.forEach(function (event) {
                        let eventName = event.name;
                        let eventImage = event.images[1].url;
                        let highestWidthImage = null;
                        for (let i = 0; i < event.images.length; i++) {
                            if (event.images[i].ratio == "16_9") {
                                if (highestWidthImage == null || event.images[i].width > highestWidthImage.width) {
                                    highestWidthImage = event.images[i];
                                }
                            }
                        }
                        if (highestWidthImage != null) {
                            console.log("Event: " + event.name + ", Highest Width Image: " + highestWidthImage.url);
                            eventImage = highestWidthImage.url;
                        } else {
                            console.log("No 16_9 image found for event: " + event.name);
                        }
                        let eventDate = event.dates.start.localDate;
                        eventDate = new Date(eventDate).toDateString()

                        let eventTime = event.dates.start.localTime;
                        eventTime = convert(eventTime);
                        let venueName = event._embedded.venues[0].name;
                        let venueCity = event._embedded.venues[0].city.name;
                        let venueState = event._embedded.venues[0].state.stateCode;
                        let venueAddress = event._embedded.venues[0].address.line1;
                        let venueTicketLink = event.url;
                        let minPriceRange, maxPriceRange;
                        let currency;
                        let pricerange = "";
                        if (event.priceRanges && event.priceRanges.length > 0 && 'currency' in event.priceRanges[0]) {
                            currency = event.priceRanges[0].currency;
                        }
                        if (event.priceRanges && event.priceRanges.length > 0) {
                            if ('min' in event.priceRanges[0]) {
                                minPriceRange = event.priceRanges[0].min;
                            }
                            if ('max' in event.priceRanges[0]) {
                                maxPriceRange = event.priceRanges[0].max;
                            }
                            if (maxPriceRange != minPriceRange) {
                                pricerange = `<p class="p text-secondary">${currency} Price Range: $${minPriceRange} - $${maxPriceRange}</p>`
                            }
                            else {
                                pricerange = `<p class="p text-secondary">${currency} Price: $${minPriceRange}</p>`
                            }
                        }


                        // console.log("Venue Ticket Link: " +venueTicketLink);
                        let card = `
                        <div class="row">
                        <div class="col-12 px-3">
                            <div class="card my-2 border shadow rounded px-3" style="width: 100%">
                                <div class="row my-3">
                                    <div class="col-md-4 col-12 d-flex align-items-center">
                                        <img class="img-fluid" src="${eventImage}">
                                    </div>
                                    <div class="col-md-4 col-6 my-3">
                                        <h1 class="h2">${eventName}</h1>
                                        <br>
                                        <h2 class="h3 text-secondary">${venueName}</h2>
                                        <p class="p text-secondary"></p>
                                        <p class="p text-secondary">${venueAddress}.<br>${venueCity}, ${venueState}</p>
                                        ${pricerange}
                                        <a href="${venueTicketLink}" class="btn btn-primary">Find tickets</a>
                                    </div>
                                    <div class=" col-md-4 col-6 text-end my-3">
    <h3 class="h3 text-success ">${eventDate}</h3>
    <h3 class="h3 text-success ">${eventTime}</h3>
</div>
                                </div>
                            </div>
                        </div>
                    </div>
                        `
                        $("#card-container").append(card);
                    });
                }
                else {
                    $("#card-container").append(`<h3 class="pt-4">Sorry... No results were found for the entered search term and city.</h3>`)

                    //=======================================================================================================
                    // Logic for what happens here if neither are empty...
                    // ON CLICK, get:
                    // [] Event Name
                    // [] Event Image
                    // [] Event Start date and time
                    // [] Venue name
                    // [] Venute city
                    // [] Venue state
                    // [] Venue address
                    // [] Venute ticket link
                    // [] Must present these all in the form of a bootstrap card, dynamically.
                    // [] Must be sorted in ascending order based on the event's dates.
                    //=======================================================================================================
                }
            }
            ,
            error: function (xhr, status, err) {

            }
        });


        //   D7vEv0uy1A4ZVSByA6KbKX6Yk0EVAQG3

    }
});

function convert(input) {
    return moment(input, 'HH:mm').format('h:mm A');
}