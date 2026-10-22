// Ricerca binaria iterativa. Funziona solo su un array ORDINATO.
// Si guarda l'elemento a metà dell'intervallo [lo, hi]: se è x abbiamo
// finito, altrimenti si scarta la metà in cui x non può stare.
#include <iostream>
#include <vector>
using namespace std;

//@region binaria
// Indice di x in a (ordinato); -1 se x non c'è.
int binarySearch(const vector<int>& a, int x) {
    int n = a.size();
    int lo = 0, hi = n - 1;                   //@init
    while (lo <= hi) {                        //@loop
        int mid = lo + (hi - lo) / 2;         //@mid
        if (a[mid] == x) {                    //@eq
            return mid;                       //@found
        } else if (a[mid] < x) {              //@lt
            lo = mid + 1;                     //@right
        } else {
            hi = mid - 1;                     //@left
        }
    }
    return -1;                                //@notfound
}
//@endregion

int main() {
    vector<int> a = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    for (int x : {23, 2, 91, 7, 100}) {
        cout << "cerco " << x << ": indice " << binarySearch(a, x) << '\n';
    }
    return 0;
}
