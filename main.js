var alcoholArray = new Array();
var alcoholDensity = 0.79;
var maleFactor = 0.7;
var femaleFactor = 0.6;
var alcoholMetabolism = 0.15;

$(document).ready(() => {
  $('#addButton').click(addAlcohol);
  $(document).on('click', '.trashIcon', (event) => {
    console.log(event.currentTarget.id - 1);
    alcoholArray.splice(event.currentTarget.id - 1, 1);
    setAlcoholList();
    calculateBAC();
  });
  $('#userWeight').on('input', () => {
    if(isCorrectInput($('#userWeight').val()) && (isCorrectInput($('#timeDrinking').val()))) calculateBAC();
    setResultsDisplay();
  });
  $('#timeDrinking').on('input', () => {
    if(isCorrectInput($('#userWeight').val()) && (isCorrectInput($('#timeDrinking').val()))) calculateBAC();
    setResultsDisplay();
  });
  $('input[type=radio][name=gender]').change(() => {
    if (isCorrectInput($('#userWeight').val())) calculateBAC();
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
  var alcoholAmount = (alcoholContent / 100) * drinkVolume;
  alcoholArray.push({drinkVolume: roundNumber(drinkVolume), alcoholContent: roundNumber(alcoholContent), alcoholAmountML: roundNumber(alcoholAmount),
    alcoholAmountG: roundNumber(alcoholAmount * alcoholDensity)});
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
    output += "<div class = \"col-sm alcoholBox\"> <p> " + i +".</p><p> Volume[ml]: " + alcoholArray[i - 1].drinkVolume + "</p>";
    output += "<p> Alcohol content [%]: " + alcoholArray[i - 1].alcoholContent + "</p>";
    output += "<p> Amount of alcohol [ml]: " + alcoholArray[i - 1].alcoholAmountML + "</p>";
    output += "<p> Amount of alcohol [g]: " + alcoholArray[i - 1].alcoholAmountG + "</p><i class=\"material-icons trashIcon\" id = \"" + i + "\">delete</i></div>";
    if (!(i % 3)) output += "</div><div class = \"row\">";
  }
  if (alcoholArray.length % 3) output += "</div>";
  $("#alcoholList").html(output);
  setResultsDisplay();
}

function calculateBAC() {
  if (alcoholArray.length <= 0) return;
  var totalAlcoholML = 0;
  for(var i = 0; i < alcoholArray.length; i++) totalAlcoholML += alcoholArray[i].alcoholAmountML;
  var totalAlcoholG = totalAlcoholML * alcoholDensity;
  var bodyWaterWeight = $('#userWeight').val();
  bodyWaterWeight *= $('#male').prop('checked') ? maleFactor : femaleFactor;
  var userBAC = totalAlcoholG / bodyWaterWeight - $('#timeDrinking').val() * alcoholMetabolism;
  if (userBAC < 0) userBAC = 0;
  var soberingTime = calculateSoberingTime(userBAC);
  $('#alcoholIngestedML').html(roundNumber(totalAlcoholML));
  $('#alcoholIngestedG').html(roundNumber(totalAlcoholG));
  $('#BAC').html(roundNumber(userBAC));
  $('#soberIn').html(soberingTime.h + " hour(s) " + soberingTime.m + "minute(s)");
}

function setResultsDisplay() {
  if (alcoholArray.length >= 1 && isCorrectInput($('#userWeight').val()) && isCorrectInput($('#timeDrinking').val())) $('#results').css("display", "block");
  else $('#results').css("display", "none");
}

function roundNumber(number) {
  return Math.floor(number * 1000) / 1000;
}

function calculateSoberingTime(userBAC) {
  var time = Math.floor((userBAC / alcoholMetabolism) * 60);
  return {h: Math.floor(time / 60), m: time % 60};
}
