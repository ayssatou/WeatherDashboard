$(document).ready(function () {
    var cityList = localStorage.cityList && localStorage.cityList !== undefined
    ? JSON.parse(localStorage.cityList)
    : [];

    for(var i = 0; i < cityList.length; i++){
        addCity(cityList[i],false);
    }
});

function getIntDate(offset) {
  var dt = new Date();
  dt.setDate(dt.getDate() + offset);
  return dt.getTime().toString();
}

function searchCity(city) {
  if (!city) city = $("#city").val().trim();
  if (city === "") {
    alert("The city to search cannot be empty!");
    return;
  }
  console.log(getIntDate(2).slice(0, 10));
  fetch(
    encodeURI(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=c49757d1bfcf6a2d0dc2080d33a587ae&units=metric`
    )
  )
    .then(function (findresponse) {
      return findresponse.json();
    })
    .then(function (finddata) {
      fetch(
        encodeURI(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${finddata.coord.lat}&lon=${finddata.coord.lon}&appid=c49757d1bfcf6a2d0dc2080d33a587ae&units=metric`
        )
      )
        .then(function (onecallresponse) {
          return onecallresponse.json();
        })
        .then(function (onecalldata) {
          fetch(
            encodeURI(
              `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=c49757d1bfcf6a2d0dc2080d33a587ae&units=metric`
            )
          )
            .then(function (forecastresponse) {
              return forecastresponse.json();
            })
            .then(function (forecastdata) {
              addCity(city);
              applyData(city, onecalldata, forecastdata);
            })
            .catch(function (err) {
              console.log("Fetch Error : Forecast", err);
            });
        })
        .catch(function (err) {
          console.log("Fetch Error : OneCall", err);
        });
    })
    .catch(function (err) {
      console.log("Fetch Error : Find", err);
    });
}

function applyData(city, data, forecast) {
  console.log(data);
  console.log(forecast);
  $("#data-city").text(city);
  var date = new Date(parseInt(data.current.dt + "000"));
  $("#data-date").text(
    date.getUTCMonth() + "/" + date.getUTCDate() + "/" + date.getUTCFullYear()
  );
  $("#cur-temp").text(data.current.temp);
  $("#cur-wind").text(data.current.wind_speed);
  $("#cur-hum").text(data.current.humidity);
  $("#cur-uvi").text(data.current.uvi);
  $("#cur-icon").attr(
    "src",
    `https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`
  );

  for (var i = 0; i < 5; i++) {
    date = new Date(parseInt(forecast.list[i * 8].dt + "000"));
    $("#forecast-date-" + (i + 1)).text(
      date.getUTCMonth() + "/" + date.getUTCDate() + "/" + date.getUTCFullYear()
    );
    $("#forecast-temp-" + (i + 1)).text(forecast.list[i * 8].main.temp);
    $("#forecast-wind-" + (i + 1)).text(forecast.list[i * 8].wind.speed);
    $("#forecast-hum-" + (i + 1)).text(forecast.list[i * 8].main.humidity);
    $("#forecast-icon-" + (i + 1)).attr(
      "src",
      `https://openweathermap.org/img/wn/${
        forecast.list[i * 8].weather[0].icon
      }@2x.png`
    );
  }
}

function addCity(city, register = true) {
  $(".city-btn").each(function (index, element) {
    if ($(element).text().trim() === city || index > 9) {
      $(element).remove();
    }
  });
  $("#cities").prepend(
    `<button class="row city-btn btn btn-secondary" onclick="searchCity('${city}')">${city}</button>`
  );

  if (register) {
    var cityList = [];
    $(".city-btn").each(function (index, element) {
      cityList.push($(element).text().trim());
    });
    localStorage.cityList = JSON.stringify(cityList);
  }
}
