// Ricerca binaria ricorsiva: la stessa idea della versione iterativa, ma
// l'intervallo [lo, hi] viaggia nei parametri. Ogni chiamata ne fa al
// massimo una sola: la profondità della ricorsione è O(log n).
#include <iostream>
#include <vector>
using namespace std;

//@region ricorsiva
int binarySearchRec(const vector<int>& a, int x, int lo, int hi) {
    if (lo > hi) return -1;                          // intervallo vuoto: x non c'è
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == x) return mid;
    if (a[mid] < x) return binarySearchRec(a, x, mid + 1, hi);   // cerca a destra
    return binarySearchRec(a, x, lo, mid - 1);                   // cerca a sinistra
}
//@endregion

int main() {
    vector<int> a = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    int n = a.size();
    // la prima chiamata copre tutto l'array: [0, n-1]
    cout << "cerco 56: indice " << binarySearchRec(a, 56, 0, n - 1) << '\n';
    cout << "cerco 13: indice " << binarySearchRec(a, 13, 0, n - 1) << '\n';
    return 0;
}
