function getStartConfig() {
    $.get('call/Model/getConfig').done(function(cfg) {
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
        //document.getElementById("cfg_n_aptamer_insert").innerHTML = cfg.result.cfg_n_aptamer;
        //document.getElementById("cfg_n_inhib").value = cfg.result.cfg_n_inhib;
        document.getElementById("cfg_growth").checked = cfg.result.cfg_growth;
        document.getElementById("cfg_t_readProtein").value = cfg.result.cfg_t_readProtein;
        //displayInhibitionFormula();
    });
}
/*
function displayInhibitionFormula() {
    var apt = document.getElementById("cfg_n_aptamer").value;
    var fac = document.getElementById("cfg_n_inhib").value;
    document.getElementById("cfg_n_aptamer_insert").innerHTML = apt;
    document.getElementById("inhib").innerHTML = (1 - Math.pow((1/fac), apt)).toFixed(5);
}
*/

// global variables
var chart;
var currentSeries;

function buildChart() {
    Highcharts.setOptions({
        colors: ['#000000', '#0066FF', '#FF9900', '#990066', '#009900', '#FF0000', '#CC66FF', '#CCFF00']
    });
    chart = new Highcharts.Chart('chart', {
        chart: {
            type: 'line',
            events: { load: getData },
            plotBorderColor: 'black',
            plotBorderWidth: 1
        }, title: {
            text: 'Translation simulation (single cell)',
            style: {
                fontSize: 10,
                fontWeight: 'bold'
            },
            y: 20,
        }, legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            margin: 0,
            x: 0,
            y: 100,
            itemStyle: {
                fontSize: "8px"
            }
        }, yAxis: {
            labels: {
                x: -4,
                style: {
                    fontSize: "6px"
                }
            },
            title: {
                text: 'Proteins'
            },
            tickInterval: 200
        }, xAxis: {
            labels: {
                style: {
                    fontSize: "6px"
                }
            },
            title: {
                text: 'time [min]',
                style: {
                    fontSize: "6px"
                }
            },
            tickInterval: 60
        }, credits: {
            enabled: false
        },
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
        getData().done(addToChart); // one last time before we quit
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
    var legend = document.getElementById("custom_legend").value;
    chart.addSeries({
        name: legend === "" ? apt + " Apt." : legend,
        data: [],
        marker: { enabled: false }
    });
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
        //displayInhibitionFormula();
        
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
            999 //document.getElementById("cfg_n_inhib").value,
        ];
        var cfgF = [
            document.getElementById("cfg_t_start").value,
            document.getElementById("cfg_t_stop").value,
            document.getElementById("cfg_t_riboSearch").value,
            document.getElementById("cfg_t_riboAttach").value,
            document.getElementById("cfg_t_riboDecodeCodon").value,
            document.getElementById("cfg_t_readProtein").value,
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

    document.getElementById('viz.mrna').addEventListener("click", function() {
        $.ajax({
            url: 'call/Model/getMrnaStructure',
            type: 'GET'
        }).done(function(data) {
            log(JSON.stringify(data.result));
        });
    });

});
