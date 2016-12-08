# extract reaction rate data into separate files
system "for i in $(grep -o '^reaction[0-9]' data); do grep -- $i data > $i ; done"

files = "`echo $(grep -o '^reaction[0-9]' data)`"


# extract reactants quantity data
system "egrep -v -- 'reaction' data > reactants"

# last column
n = "`head -n1 reactants | wc -w`"

set terminal pdf enhanced size 20cm,20cm
set output "plot.pdf"

#set key autotitle columnheader

set grid xtics ytics
show grid
set xtics nomirror
set border 11 #bottom+left+right

set multiplot layout 2,1

# Reaction quantities
set xlabel "time"
set ylabel "quantity" offset 1,0
plot for [i=3:n] 'reactants' using ($1/$2):i with lines title columnhead(i)

# Reaction rates
set ylabel "reaction rate" offset 1,0
plot for [file in files] file using ($1/$2):($4/$5) with points title columnheader(2)

unset multiplot
