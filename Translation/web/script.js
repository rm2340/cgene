function getStartConfig() {
    $.get('call/Model/getConfig')
    .done(function(cfg) {
        document.getElementById("cfg.tstart").value = cfg.result.tStart;
        document.getElementById("cfg.tstop").value = cfg.result.tStop;
        document.getElementById("cfg.translation").checked = cfg.result.Translation == 1 ? true : false;
        document.getElementById("cfg.mrna").value = cfg.result.mRNA;
        document.getElementById("cfg.protein").value = cfg.result.Protein;
        document.getElementById("cfg.ribosome").value = cfg.result.Ribosome;
        document.getElementById("cfg.naptamer").value = cfg.result.nAptamer;
        document.getElementById("cfg.ligand").checked = cfg.result.Ligand == 1 ? true : false;
        document.getElementById("cfg.growth").checked = cfg.result.Growth == 1 ? true : false;
    });
}

var chart; // global
function buildChart() {
    chart = new Highcharts.Chart('chart1', {
        chart: {
            type: 'line',
            events: { load: getData }
        },
        title: {
            text: 'Translation simulation (single cell)'
        },
        yAxis: {
            title: {
                text: 'Quantity'
            }
        },
        series: [{
            name: "Protein",
            data: []
        }]
    });
}

function getData() {
    return $.ajax({
        url: 'call/Logger/getProteinLog',
        type: 'GET'
    });
}

setInterval(function() { 
    getData().done(addToChart); 
}, 1000);

function addToChart(data) {
    const result = data['result'];
    Object.keys(result).forEach(function(key) {
        var k = parseInt(key);
        var v = result[key];
        chart.series[0].addPoint([k, v], false, false);
    });
    chart.redraw();
}

function startSim() {
    $.when(
        $.ajax({
            url: 'call/Model/startSim',
            type: 'GET'
            }).done(startSimDone),
        $.ajax({
            url: 'call/Model/stopSimOnTimeout',
            type: 'GET'
            }).done()
    ).then(function(t1, t2) {
        var p = $.ajax({
            url: 'call/Model/getQProtein',
            type: 'GET'
        }).then(function(p) {
            stopSimDone([t2[0], p]);
        });
    });
}


function stopSim() {
    $.ajax({
        url: 'call/Model/stopSim',
        type: 'GET'
    }).done(function(t) {
        return [t, getQProtein()];
    });
}

function getQProtein() {
    return $.ajax({
        url: 'call/Model/getQProtein',
        type: 'GET'
    });
}

function startSimDone(ret) {
    var button = document.getElementById("sim.start");
    button.value = "Stop";
    button.removeEventListener("click", startSim);
    button.addEventListener("click", stopSim);
    document.getElementById("sim.status").innerHTML = "Simulation running";
    document.getElementById('dump').innerText += JSON.stringify(ret.result) + " Simulation started\n";
}

 function stopSimDone(ret) {
    var button = document.getElementById("sim.start");
    button.value = "Start";
    button.removeEventListener("click", stopSim);
    button.addEventListener("click", startSim);
    document.getElementById("sim.status").innerHTML = "Simulation stopped";
    document.getElementById('dump').innerText += JSON.stringify(ret[0].result) + " Simulation stopped; " + JSON.stringify(ret[1].result) + " Proteins\n";
    //button.disabled = true;
}


$(document).ready(function() {
    getStartConfig();
    buildChart();

    document.getElementById("sim.start").addEventListener("click", startSim);

    document.getElementById('cfg.set').addEventListener("click", function() {
        //this.disabled = true;
        var cfg = [
            document.getElementById("cfg.tstart").value,
            document.getElementById("cfg.tstop").value,
            document.getElementById("cfg.translation").checked == true ? 1 : 0,
            document.getElementById("cfg.protein").value,
            document.getElementById("cfg.ribosome").value,
            document.getElementById("cfg.mrna").value,
            document.getElementById("cfg.naptamer").value,
            document.getElementById("cfg.ligand").checked == true ? 1 : 0, 
            document.getElementById("cfg.growth").checked == true ? 1 : 0 
        ];
        $.post("call/Model/setConfig", JSON.stringify({ "cfg": cfg }))
        .done(function() {
            console.log("cfg set success");
        })
        .fail(function(xhr, status, error) {
            console.log(JSON.stringify(xhr.responseText));
        })
        .always(function() {
            // not sure why this doesn't enable it back
            //this.disabled = false;
        });
    });

    document.getElementById('sim.vizmrna').addEventListener("click", function() {
        $.ajax({
            url: 'call/Model/vizMrna',
            type: 'GET'
        }).done(function(data) {
            document.getElementById('dump').innerHTML = JSON.stringify(data.result);
        });
    });
});
