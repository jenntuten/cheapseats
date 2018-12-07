            let nbaUrl = "https://api.seatgeek.com/2/events?taxonomies.name=nba&client_id=MTQyMjQwNjN8MTU0Mzk1MjQxOS45OQ"
            
            let newArray = [];
            $.ajax({
                url: nbaUrl,
                method: "GET"
            }).then(data => {
                console.log('data.events', data.events)
                let gameFilter = data.events;
                let filteredGames;
                let games = []
                for (let r = 0; r < gameFilter.length; r++) {
                    console.log('gameFilter[r]', gameFilter[r]);
                    filteredGames = gameFilter[r]
                    console.log('filtered inside loop', filteredGames)
                    Object.keys(filteredGames).forEach(function (key) {
                        if (filteredGames.stats.average_price === null || filteredGames.stats.lowest_price === null) {
                            filteredGames.stats.average_price = 0;
                            filteredGames.stats.lowest_price = 0;
                        }
                    })
                    games.push(filteredGames)
                }
                console.log('GAME FILTER:', games);

                for (let i = 0; i < games.length; i++) {

                    console.log("Matchup: ", games[i].title)
                    console.log("Location: ", games[i].venue.display_location + " - ", games[i].venue.name)
                    console.log("Date and Time: ", moment(games[i].datetime_local).format("dddd, LL"))
                    console.log("Average Ticket Price: $" + games[i].stats.average_price.toFixed(2))

                    //Calculate distance using GeoDataSource code.

                    let secondLatitude = games[i].venue.location.lat;
                    console.log('2ndlat', secondLatitude)
                    let secondLongitude = games[i].venue.location.lon;
                    var dist = distance(firstLatitude, firstLongitude, secondLatitude, secondLongitude, 'M');

                    function distance(lat1, lon1, lat2, lon2, unit) {
                        if ((lat1 == lat2) && (lon1 == lon2)) {
                            return 0;
                        }
                        else {
                            var radlat1 = Math.PI * lat1 / 180;
                            var radlat2 = Math.PI * lat2 / 180;
                            var theta = lon1 - lon2;
                            var radtheta = Math.PI * theta / 180;
                            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                            if (dist > 1) {
                                dist = 1;
                            }
                            dist = Math.acos(dist);
                            dist = dist * 180 / Math.PI;
                            dist = dist * 60 * 1.1515;
                            if (unit == "K") { dist = dist * 1.609344 }
                            if (unit == "N") { dist = dist * 0.8684 }
                            return dist;
                        }//Else statement
                    }//Distance function
                    console.log(dist);

                    let dateTime = moment(games[i].datetime_local).format("dddd, LL");

                    newArray.push({
                        game: games[i].title,
                        url: games[i].url,
                        distance: parseInt(dist),
                        average: games[i].stats.average_price.toFixed(2),
                        starting: games[i].stats.lowest_price.toFixed(2),
                        date: moment(games[i].datetime_local).format("dddd, LL"),
                        location: games[i].venue.display_location,
                        venue: games[i].venue.name,
                        id: [i]
                    })//Push to array
                    console.log('new array:', newArray)

                    var lessThan = newArray.filter(obj => {
                        return obj.distance < 500 && obj.starting > 1 && obj.average > 1;
                    })

                    lessThan.sort(function (a, b) {
                        return parseFloat(a.starting) - parseFloat(b.starting);
                    });

                    let rowItems = lessThan.map(function (p) {
                        return `<tr><td>${p.game}</td>
                                    <td>${p.date}</td>
                                    <td>${p.location}</td>
                                <td>${p.venue}</td>
                                <td>$${p.starting}</td>
                                <td>$${p.average}</td>
                                <td>${p.distance}</td>
                                <td><button class="seatgeek" id = "${p.id}"><a href="${p.url}" target="_blank">Visit SeatGeek</a></button></td>
                                </tr>`;
                    });
                    let tableHead = '<tr><th>Game</th><th>Date</th><th>Location</th><th>Venue</th><th>Starting Ticket Price</th><th>Average Ticket Price</th><th>Distance (in miles)</th><th>Find Tickets</th></tr>';
                    let createTable = '<table> ' + tableHead + rowItems.join('') + ' </table>';
                    $(".table").html(createTable);
                    $('.seatgeek').on('click', function () {
                        console.log('SeatGeek clicked: ', this.id);

                        let chosen = this.id;

                        console.log('CHOSEN: ', lessThan[chosen].url)

                        function openInNewTab() {
                            target = "_blank";
                            href = lessThan[chosen].url;
                            console.log('href', href)
                        }

                        // And then
                        openInNewTab(`${lessThan[chosen].url}`);
                    })
                    $('.output').append(``);

                }//For loop(i)
            })//Data success