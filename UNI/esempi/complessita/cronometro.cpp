//@check compile
// Misura il tempo vero di due ordinamenti al crescere di n con <chrono>.
// I millisecondi cambiano da un computer all'altro (per questo il controllo
// automatico lo compila soltanto): conta come crescono quando n raddoppia.
// Compila con le ottimizzazioni: g++ -std=c++17 -O2 cronometro.cpp
#include <algorithm>
#include <chrono>
#include <iomanip>
#include <iostream>
#include <random>
#include <vector>
using namespace std;

void insertionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 1; i < n; i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
}

//@region misura
// Esegue f e restituisce quanti millisecondi ha impiegato.
template <typename Funzione>
double millisecondi(Funzione f) {
    auto inizio = chrono::steady_clock::now();
    f();
    auto fine = chrono::steady_clock::now();
    return chrono::duration<double, milli>(fine - inizio).count();
}
//@endregion

int main() {
    mt19937 gen(1);
    cout << "      n   insertion (ms)   std::sort (ms)\n";
    for (int n = 4000; n <= 64000; n *= 2) {
        vector<int> a(n);
        for (int& x : a) x = gen() % 1000000;
        vector<int> b = a;                       // stessi dati per i due algoritmi
        double t1 = millisecondi([&] { insertionSort(a); });
        double t2 = millisecondi([&] { sort(b.begin(), b.end()); });
        cout << setw(7) << n << fixed << setprecision(1)
             << setw(17) << t1 << setw(17) << t2 << '\n';
    }
    return 0;
}
