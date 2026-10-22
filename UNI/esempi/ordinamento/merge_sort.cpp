// Merge sort: divide l'array a metà, ordina le due metà con la ricorsione
// e poi le fonde (merge) in un'unica sequenza ordinata.
#include <iostream>
#include <vector>
using namespace std;

//@region merge
// Fonde a[lo..mid] e a[mid+1..hi], già ordinati.
void merge(vector<int>& a, int lo, int mid, int hi) {
    vector<int> b(hi - lo + 1);       // buffer //@buffer
    int i = lo, j = mid + 1, k = 0;   //@init
    while (i <= mid && j <= hi) {     //@loop
        if (a[i] <= a[j])  // <= : stabile //@cmp
            b[k++] = a[i++];          //@take-left
        else
            b[k++] = a[j++];          //@take-right
    }
    // gli avanzi: al più uno dei due cicli lavora
    while (i <= mid) b[k++] = a[i++]; //@rest-left
    while (j <= hi) b[k++] = a[j++];  //@rest-right
    // si ricopia b in a[lo..hi]
    for (k = 0; k < hi - lo + 1; k++) //@copy-loop
        a[lo + k] = b[k];             //@copy
}
//@endregion

//@region sort
void mergeSort(vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;  // già ordinato //@base
    int mid = lo + (hi - lo) / 2;      //@mid
    mergeSort(a, lo, mid);  // metà sinistra //@left
    mergeSort(a, mid + 1, hi);  // metà destra //@right
    merge(a, lo, mid, hi);  // fusione //@merge
}
//@endregion

void stampa(const vector<int>& a) {
    for (int x : a) cout << x << ' ';
    cout << '\n';
}

int main() {
    vector<int> a = {38, 27, 43, 3, 9, 82, 10, 19};
    int n = a.size();
    cout << "Prima: ";
    stampa(a);
    mergeSort(a, 0, n - 1);                  // tutto l'array: da 0 a n-1
    cout << "Dopo:  ";
    stampa(a);
    return 0;
}
