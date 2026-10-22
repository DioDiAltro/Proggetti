// lower_bound e upper_bound scritti a mano, poi quelli della libreria <algorithm>.
// Qui l'intervallo è SEMIAPERTO [lo, hi): hi è la prima posizione fuori.
// Così la risposta può essere anche n (= "dopo l'ultimo elemento").
#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

//@region lower
// Primo i con a[i] >= x; n se non c'è.
int lowerBound(const vector<int>& a, int x) {
    int lo = 0, hi = a.size();                 //@init
    while (lo < hi) {                          //@loop
        int mid = lo + (hi - lo) / 2;          //@mid
        if (a[mid] < x)                        //@cmp
            lo = mid + 1;                      //@right
        else
            hi = mid;                          //@left
    }
    return lo;                                 //@ret
}
//@endregion

//@region upper
// Primo i con a[i] > x; n se non c'è.
int upperBound(const vector<int>& a, int x) {
    int lo = 0, hi = a.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] <= x)                       // l'unica differenza: <= al posto di <
            lo = mid + 1;
        else
            hi = mid;
    }
    return lo;
}
//@endregion

//@region stl
// Le stesse domande alla libreria. lower_bound e upper_bound restituiscono
// un iteratore: sottraendo a.begin() si ottiene l'indice.
void libreria(const vector<int>& a, int x) {
    int lb = lower_bound(a.begin(), a.end(), x) - a.begin();
    int ub = upper_bound(a.begin(), a.end(), x) - a.begin();
    bool c = binary_search(a.begin(), a.end(), x);    // solo sì o no
    cout << "   libreria: " << lb << ' ' << ub << ' ' << (c ? "true" : "false") << '\n';
}
//@endregion

int main() {
    vector<int> a = {1, 3, 3, 3, 5, 8, 8, 10};
    cout << "a = 1 3 3 3 5 8 8 10\n";
    for (int x : {3, 4, 8, 0, 11}) {
        int lb = lowerBound(a, x);
        int ub = upperBound(a, x);
        cout << "x = ";
        cout.width(2);
        cout << x << ":  lower " << lb << "  upper " << ub << "  occorrenze " << ub - lb;
        libreria(a, x);
    }
    return 0;
}
