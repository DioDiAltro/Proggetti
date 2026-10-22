// Calcola il valore esatto di tre ricorrenze facendo girare la ricorsione,
// e lo confronta con la formula chiusa ricavata nel capitolo.
//   merge sort:       T(n) = 2T(n/2) + n,  T(1) = 1   ->  n log2 n + n
//   ricerca binaria:  T(n) = T(n/2) + 1,   T(1) = 1   ->  log2 n + 1
//   torre di Hanoi:   T(n) = 2T(n-1) + 1,  T(1) = 1   ->  2^n - 1
#include <iomanip>
#include <iostream>
using namespace std;

typedef long long ll;

//@region ricorrenze
ll tMerge(ll n) {
    if (n == 1) return 1;
    return 2 * tMerge(n / 2) + n;
}

ll tBinaria(ll n) {
    if (n == 1) return 1;
    return tBinaria(n / 2) + 1;
}

ll tHanoi(ll n) {
    if (n == 1) return 1;
    return 2 * tHanoi(n - 1) + 1;
}
//@endregion

int main() {
    cout << "      n   tMerge  n*log2(n)+n   tBinaria  log2(n)+1\n";
    ll k = 0;                                   // k = log2(n)
    for (ll n = 1; n <= 1024; n *= 2, k++) {
        cout << setw(7) << n << setw(9) << tMerge(n) << setw(13) << n * k + n
             << setw(11) << tBinaria(n) << setw(11) << k + 1 << '\n';
    }
    cout << "\n  n   tHanoi   2^n - 1\n";
    for (ll n = 1; n <= 10; n++) {
        cout << setw(3) << n << setw(9) << tHanoi(n) << setw(10) << (1LL << n) - 1 << '\n';
    }
    return 0;
}
