/*
  "BAC Calculator" by mstopin | https://github.com/mstopin
  Do not remove this! 
*/
//const
var alcoholDensity = 0.79;
var maleFactor = 0.7;
var femaleFactor = 0.6;
var alcoholMetabolism = 0.15;
//
var alcoholArray = new Array();
var currentBAC = null;
var currentMassUnit = false; //KG -> false, LB -> true
var currentVolumeUnit = false; //ML -> false, FL OZ -> true

$(document).ready(() => {
  $('#addButton').click(addAlcohol);
  $(document).on('click', '.trashIcon', (event) => {
    alcoholArray.splice(event.currentTarget.id - 1, 1);
    setAlcoholList();
    calculateBAC();
  });
  $('#userWeight').on('input', () => {
    calculateBAC();
    setResultsDisplay();
  });
  $('#timeDrinking').on('input', () => {
    calculateBAC();
    setResultsDisplay();
  });
  $('input[type=radio][name=gender]').change(() => {
    calculateBAC();
  });
  $('input[type=radio][name=weight]').change(() => {
    currentMassUnit = !($('#kgUnit').is(':checked'));
    if (currentMassUnit) {
      $('#weightP').html("Your weight [lb]:");
      $('#ingestedMassP').html("Alcohol ingested [lb]:");
    }
    else {
      $('#weightP').html("Your weight [kg]:");
      $('#ingestedMassP').html("Alcohol ingested [g]:")
    }
    setAlcoholList();
    calculateBAC();
  });
  $('input[type=radio][name=volume]').change(() => {
    currentVolumeUnit = !($('#mlUnit').is(':checked'));
    if (currentVolumeUnit) {
      $('#volumeP').html("Volume[oz]:");
      $('#ingestedVolumeP').html("Alcohol ingested [oz]:");
    }
    else {
      $('#volumeP').html("Volume[ml]:");
      $('#ingestedVolumeP').html("Alcohol ingested [ml]:");
    }
    setAlcoholList();
    calculateBAC();
  });
  $('#BAC').on('mouseover', () => {
    $('#BAC').html(roundNumber(currentBAC / 10) + " %");
  });
  $('#BAC').on('mouseout', () => {
    $("#BAC").html(currentBAC + " ‰");
  });
  $('#toggleSettings').click(() => {
      if($('#settings').css("display") == "block") {
        $('#toggleSettings').html("Settings ▼");
        $('#settings').css("display", "none");
      } else {
      $('#toggleSettings').html("Settings ▲");
      $('#settings').css("display", "block");
      }
    });
  $('#toggleTable').click(() => {
    if ($('#intoxicationTable').css("display") == "block") {
      $('#toggleTable').html("Intoxication table ▼");
      $('#intoxicationTable').css("display", "none");
    }
    else {
      $('#toggleTable').html("Intoxication table ▲");
      $('#intoxicationTable').css("display", "block");
    }
  });
});

function addAlcohol() {
  var drinkVolume = $('#drinkVolume').val();
  var alcoholContent = $('#alcoholContent').val();
  if (!isCorrectInput(drinkVolume) || !isCorrectInput(alcoholContent)) {
    $('#invalidDataWarning').css("display", "block");
    return;
  }
  else if ($('#invalidDataWarning').css("display") == "block") $('#invalidDataWarning').css("display", "none");
  if (currentVolumeUnit) drinkVolume = ozToML(drinkVolume);
  var alcoholAmountVolume = (alcoholContent / 100) * drinkVolume;
  alcoholArray.push({drinkVolume: drinkVolume, alcoholContent: alcoholContent, alcoholAmountVolume: alcoholAmountVolume,
    alcoholAmountMass: alcoholAmountVolume * alcoholDensity});
  setAlcoholList();
  calculateBAC();
}

function isCorrectInput(input) {
  if (input.length <= 0) return false;
  for(var i = 0; i < input.length; i++) {
    if ((input.charCodeAt(i) < 48 || input.charCodeAt(i) > 57) && input.charAt(i) != '.') return false;
  }
  return true;
}

function setAlcoholList() {
  var output = "<div class = \"row\">";
  for(var i = 1; i <= alcoholArray.length; i++) {
    var currentAlcohol = convertAlcoholData(alcoholArray[i - 1]);
    output += "<div class = \"col-sm box\"> <p> " + i +".</p>";
    output += "<p> Volume " + ((currentVolumeUnit) ? "[oz]" : "[ml]") + ": " + roundNumber(currentAlcohol.drinkVolume) + "</p>";
    output += "<p> Alcohol content [%]: " + roundNumber(currentAlcohol.alcoholContent) + "</p>";
    output += "<p> Amount of alcohol " + ((currentVolumeUnit) ? "[oz]" : "[ml]") + ": " + roundNumber(currentAlcohol.alcoholAmountVolume) + "</p>";
    output += "<p> Amount of alcohol " + ((currentMassUnit) ? "[lb]" : "[g]") + ": " + roundNumber(currentAlcohol.alcoholAmountMass);
    output += "</p><i class=\"material-icons trashIcon\" id = \"" + i + "\">delete</i></div>";
    if (!(i % 3)) output += "</div><div class = \"row\">";
  }
  if (alcoholArray.length % 3) output += "</div>";
  $("#alcoholList").html(output);
  setResultsDisplay();
}

function calculateBAC() {
  if (alcoholArray.length <= 0) return;
  if (!isCorrectInput($('#userWeight').val()) || !isCorrectInput($('#timeDrinking').val())) return;
  if (parseFloat($('#userWeight').val()) <= 0) return;
  var totalAlcoholVolume = 0;
  for(var i = 0; i < alcoholArray.length; i++) totalAlcoholVolume += alcoholArray[i].alcoholAmountVolume;
  var totalAlcoholMass = totalAlcoholVolume * alcoholDensity;
  var bodyWaterWeight = $('#userWeight').val();
  if (currentMassUnit) bodyWaterWeight = lbToG(bodyWaterWeight) / 1000;
  bodyWaterWeight *= $('#male').prop('checked') ? maleFactor : femaleFactor;
  var userBAC = totalAlcoholMass / bodyWaterWeight - $('#timeDrinking').val() * alcoholMetabolism;
  if (userBAC < 0) userBAC = 0;
  var soberingTime = calculateSoberingTime(userBAC);
  currentBAC = roundNumber(userBAC);
  if (currentMassUnit) totalAlcoholMass = gToLB(totalAlcoholMass);
  if (currentVolumeUnit) totalAlcoholVolume = mlToOZ(totalAlcoholVolume);
  $('#alcoholIngestedMass').html(roundNumber(totalAlcoholMass));
  $('#alcoholIngestedVolume').html(roundNumber(totalAlcoholVolume));
  $('#BAC').html(currentBAC + " ‰");
  $('#soberIn').html(soberingTime.h + " hour(s) " + soberingTime.m + " minute(s)");
  setIntoxicationTable();
}

function setIntoxicationTable() {
  var time = new Date();
  var currentHour = time.getHours();
  var currentMinute = time.getMinutes();
  var bacLevel = currentBAC;
  var output = "";
  while(bacLevel >= 0) {
    var style;
    if (bacLevel > 0.8) style = "color:red";
    else if (bacLevel > 0.2) style = "color:#eb9115";
    else style = "color:#3d7d29";
    output += "<tr>";
    output += "<td>" + (currentHour <= 9 ? ("0" + currentHour) : currentHour) + ":" + (currentMinute <= 9 ? ("0" + currentMinute) : currentMinute) + "</td>";
    output += "<td style = \"" + style + "\">" + roundNumber(bacLevel) + " ‰</td>";
    output += "</tr>";
    currentHour++;
    if (currentHour >= 24) currentHour %= 24;
    bacLevel -= alcoholMetabolism;
    if (bacLevel == -1 * alcoholMetabolism) break;
    if (bacLevel < 0) bacLevel = 0;
  }
  $("#intoxicationTableBody").html(output);
}

function setResultsDisplay() {
  if (alcoholArray.length >= 1 && isCorrectInput($('#userWeight').val()) && isCorrectInput($('#timeDrinking').val()) &&
  parseFloat($('#userWeight').val()) > 0) $('#results').css("display", "block");
  else $('#results').css("display", "none");
}

function roundNumber(number) {
  return Math.floor(number * 10000) / 10000;
}

function calculateSoberingTime(userBAC) {
  var time = Math.floor((userBAC / alcoholMetabolism) * 60);
  return {h: Math.floor(time / 60), m: time % 60};
}

function convertAlcoholData(alcohol) {
  return {
          drinkVolume: (currentVolumeUnit ? mlToOZ(alcohol.drinkVolume) : alcohol.drinkVolume),
          alcoholContent: alcohol.alcoholContent,
          alcoholAmountVolume: (currentVolumeUnit ? mlToOZ(alcohol.alcoholAmountVolume) : alcohol.alcoholAmountVolume),
          alcoholAmountMass: (currentMassUnit ? gToLB(alcohol.alcoholAmountMass) : alcohol.alcoholAmountMass)
        };
}

function ozToML(number) {
  return number * 30;
}

function mlToOZ(number) {
  return number / 30;
}

function gToLB(number) {
  return number / 453.59;
}

function lbToG(number) {
  return number * 453.59;
}
