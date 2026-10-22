// Quicksort con la partizione di Lomuto: il pivot è l'ultimo elemento.
// partition mette il pivot al suo posto definitivo, con gli elementi
// <= pivot alla sua sinistra e quelli > pivot alla sua destra; poi si
// ordinano le due parti con la ricorsione. Non serve nessun merge.
#include <iostream>
#include <vector>
using namespace std;

//@region partition
// Partiziona a[lo..hi] attorno al pivot a[hi];
// restituisce la posizione finale del pivot.
int partition(vector<int>& a, int lo, int hi) {
    int pivot = a[hi];                //@pivot
    int i = lo - 1;  // fine dei <= pivot //@i-init
    for (int j = lo; j < hi; j++) {   //@loop
        if (a[j] <= pivot) {          //@cmp
            i++;                      //@inc
            swap(a[i], a[j]);         //@swap
        }
    }
    swap(a[i + 1], a[hi]);  // pivot in mezzo //@place
    return i + 1;                     //@ret
}
//@endregion

//@region sort
void quickSort(vector<int>& a, int lo, int hi) {
    if (lo < hi) {  // almeno 2 elementi //@base
        int p = partition(a, lo, hi); //@part
        quickSort(a, lo, p - 1);  // i <= pivot //@left
        quickSort(a, p + 1, hi);  // i > pivot //@right
    }
}
//@endregion

void stampa(const vector<int>& a) {
    for (int x : a) cout << x << ' ';
    cout << '\n';
}

int main() {
    vector<int> a = {2, 8, 7, 1, 3, 5, 6, 4};
    int n = a.size();
    cout << "Prima:              ";
    stampa(a);
    int p = partition(a, 0, n - 1);
    cout << "Dopo la partizione: ";
    stampa(a);
    cout << "Il pivot 4 è finito in a[" << p << "]\n";
    quickSort(a, 0, n - 1);
    cout << "Dopo il quicksort:  ";
    stampa(a);
    return 0;
}
