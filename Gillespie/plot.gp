system "grep -v -- '->' data > data0"
system "echo 'mRNA->Protein+mRNA' > r3"
system "grep -- 'mRNA->Protein+mRNA' data >> r3"
system "echo 'Protein->' > r4"
system "grep -- 'Protein->' data >> r4"

set terminal pdf enhanced size 12cm,12cm
set output "plot.pdf"
#set key autotitle columnheader
set style data linespoints
set grid xtics
set xlabel "time" offset 0,1
set ylabel "quantity" offset 1,0

show grid

set multiplot layout 2,1

plot for [i=3:4] 'data0' using ($1/$2):i  title columnhead(i)

set ylabel "rate" offset 1,0
plot 'r3' using ($1/$2):4 title columnheader(1), 'r4' using ($1/$2):4 title columnheader(1)

unset multiplot
