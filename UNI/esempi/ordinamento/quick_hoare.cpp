// Quicksort con la partizione di Hoare (l'originale, 1961): due indici
// partono dalle estremità e si vengono incontro scambiando le coppie fuori
// posto. Fa meno scambi di Lomuto e con molti elementi uguali divide a metà.
#include <iostream>
#include <vector>
using namespace std;

//@region hoare
// Restituisce j tale che a[lo..j] <= pivot <= a[j+1..hi].
// Attenzione: il pivot NON finisce per forza in a[j].
int partitionHoare(vector<int>& a, int lo, int hi) {
    int pivot = a[lo + (hi - lo) / 2];       // elemento centrale
    int i = lo - 1, j = hi + 1;
    while (true) {
        do i++; while (a[i] < pivot);        // da sinistra: primo >= pivot
        do j--; while (a[j] > pivot);        // da destra: primo <= pivot
        if (i >= j) return j;                // si sono incrociati
        swap(a[i], a[j]);
    }
}

void quickSortHoare(vector<int>& a, int lo, int hi) {
    if (lo < hi) {
        int p = partitionHoare(a, lo, hi);
        quickSortHoare(a, lo, p);            // p incluso: qui non è "p - 1"
        quickSortHoare(a, p + 1, hi);
    }
}
//@endregion

void stampa(const vector<int>& a) {
    for (int x : a) cout << x << ' ';
    cout << '\n';
}

int main() {
    vector<int> a = {6, 3, 9, 5, 2, 8, 7, 1};
    int n = a.size();
    int p = partitionHoare(a, 0, n - 1);    // pivot = a[3] = 5
    cout << "Dopo la partizione: ";
    stampa(a);
    cout << "j = " << p << ": a[0.." << p << "] <= pivot <= a[" << p + 1 << ".." << n - 1 << "]\n";
    quickSortHoare(a, 0, n - 1);
    cout << "Ordinato:           ";
    stampa(a);
    return 0;
}
