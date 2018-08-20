function getStartConfig() {
    $.get('call/Model/getConfig')
    .done(function(cfg) {
        document.getElementById("cfg_t_start").value = cfg.result.cfg_t_start;
        document.getElementById("cfg_t_stop").value = cfg.result.cfg_t_stop;
        document.getElementById("cfg_translation").checked = cfg.result.cfg_translation;
        document.getElementById("cfg_n_protein").value = cfg.result.cfg_n_protein;
        document.getElementById("cfg_n_ribosome").value = cfg.result.cfg_n_ribosome;
        document.getElementById("cfg_t_riboSearch").value = cfg.result.cfg_t_riboSearch;
        document.getElementById("cfg_t_riboAttach").value = cfg.result.cfg_t_riboAttach;
        document.getElementById("cfg_t_riboDecodeCodon").value = cfg.result.cfg_t_riboDecodeCodon;
        document.getElementById("cfg_n_mrna").value = cfg.result.cfg_n_mrna;
        document.getElementById("cfg_ligand").checked = cfg.result.cfg_ligand;
        document.getElementById("cfg_n_aptamer").value = cfg.result.cfg_n_aptamer;
        document.getElementById("cfg_n_aptamer_insert").innerHTML = cfg.result.cfg_n_aptamer;
        document.getElementById("cfg_n_inhib").value = cfg.result.cfg_n_inhib;
        document.getElementById("cfg_growth").checked = cfg.result.cfg_growth;
        document.getElementById("cfg_t_readProtein").value = cfg.result.cfg_t_readProtein;
        displayInhibitionFormula();
    });
}
function displayInhibitionFormula() {
    var apt = document.getElementById("cfg_n_aptamer").value;
    var fac = document.getElementById("cfg_n_inhib").value;
    document.getElementById("cfg_n_aptamer_insert").innerHTML = apt;
    document.getElementById("inhib").innerHTML = (1 - Math.pow((1/fac), apt)).toFixed(2);
}

// global variables
var chart;
var currentSeries;

function buildChart() {
    chart = new Highcharts.Chart('chart', {
        chart: {
            type: 'line',
            events: { load: getData }
        }, title: {
            text: 'Translation simulation (single cell)'
        }, legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
        }, yAxis: {
            title: {
                text: 'Proteins'
            }
        }, xAxis: {
            title: {
                text: 'time [min]'
            }
        }
    });
}

function getData() {
    return $.ajax({
        url: 'call/Logger/getProteinLog',
        type: 'GET'
    });
}

function addToChart(data) {
    const result = data['result'];
    Object.keys(result).forEach(function(key) {
        var k = parseInt(key);
        var v = result[key];
//        chart.series[0].addPoint([k, v], false, false);
        chart.series[currentSeries].addPoint([k, v], false, false);
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
    ).done(stopSim);
}

function stopSim() {
    $.when(
        $.ajax({
            url: 'call/Model/getQProtein',
            type: 'GET'
        }),
        $.ajax({
            url: 'call/Model/getCurrentTime',
            type: 'GET'
        })
    ).done(function(p, t) {
        getData(); // one last time before we quit
        stopSimDone(t[0], p[0]);
        $.ajax({
            url: 'quit',
            type: 'GET'
        });
    });
}

function getQProtein() {
    return $.ajax({
        url: 'call/Model/getQProtein',
        type: 'GET'
    });
}

function startSimDone(time) {
    var apt = document.getElementById("cfg_n_aptamer").value;
    chart.addSeries({ name: apt + " Apt.", data: [], marker: {enabled: false} });
    var n = chart.series.length;
    currentSeries = n-1;
    
    var button = document.getElementById("sim.start");
    button.value = "Stop";
    button.removeEventListener("click", startSim);
    button.addEventListener("click", stopSim);
    document.getElementById("sim.status").innerHTML = "Simulation running";
    log(JSON.stringify(time.result) + " Simulation started");
}

 function stopSimDone(time, prot) {
    var button = document.getElementById("sim.start");
    button.value = "Start";
    button.removeEventListener("click", stopSim);
    button.addEventListener("click", startSim);
    document.getElementById("sim.status").innerHTML = "Simulation stopped";
    log(JSON.stringify(time.result) + " Simulation stopped; " + JSON.stringify(prot.result) + " Proteins");
    //button.disabled = true;
}

function makeFloat(v) {
/*
    if (v.search("[.]") == -1) {
        v = v + ".0";
    }
    return v.toString();
*/
    return v;
}

function log(msg) {
    document.getElementById('dump').innerText += msg + "\n";
}

function setChartRefreshInterval(t) {
    console.log(t);
}

$(document).ready(function() {
    getStartConfig();
    buildChart();
    setInterval(function() { 
        getData().done(addToChart); 
    }, 1000);

    document.getElementById("sim.start").addEventListener("click", startSim);

    document.getElementById('cfg.set').addEventListener("click", function() {
        //this.disabled = true;
        displayInhibitionFormula();
        
        var cfg = [ /* ...FIXME... waiting for Rudi... */ ];
        /*
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
        */
        var cfgB = [
            document.getElementById("cfg_translation").checked,
            document.getElementById("cfg_ligand").checked, 
            document.getElementById("cfg_growth").checked,
        ];
        var cfgI = [
            document.getElementById("cfg_n_protein").value,
            document.getElementById("cfg_n_ribosome").value,
            document.getElementById("cfg_n_mrna").value,
            document.getElementById("cfg_n_aptamer").value,
            document.getElementById("cfg_n_inhib").value,
        ];
        /* Need Rudi to FIX THIS */
        var cfgF = [
            makeFloat(document.getElementById("cfg_t_start").value),
            makeFloat(document.getElementById("cfg_t_stop").value),
            makeFloat(document.getElementById("cfg_t_riboSearch").value),
            makeFloat(document.getElementById("cfg_t_riboAttach").value),
            makeFloat(document.getElementById("cfg_t_riboDecodeCodon").value),
            makeFloat(document.getElementById("cfg_t_readProtein").value),
        ];
        $.when(
            $.post("call/Model/setConfigB", JSON.stringify({ "cfg": cfgB })),
            $.post("call/Model/setConfigI", JSON.stringify({ "cfg": cfgI })),
            $.post("call/Model/setConfigF", JSON.stringify({ "cfg": cfgF })))
        .done(function() {
            log("Model configuration updated");
        })
        .fail(function(xhr, status, error) {
            console.log(JSON.stringify(xhr.responseText));
        })
        .always(function() {
            // not sure why this doesn't enable it back
            //this.disabled = false;
        });
    });

/*
    document.getElementById('sim.vizmrna').addEventListener("click", function() {
        $.ajax({
            url: 'call/Model/vizMrna',
            type: 'GET'
        }).done(function(data) {
            log(JSON.stringify(data.result));
        });
    });
*/
});
