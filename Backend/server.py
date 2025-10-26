from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# ========== DATABASE CONFIGURATION ==========
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'Atomberg_Electrolyte',  # CHANGE THIS
    'user': 'postgres',              # CHANGE THIS
    'password': 'your password'      # CHANGE THIS
}

def get_db_connection():
    """Create database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except psycopg2.Error as e:
        print(f"Database connection error: {e}")
        return None

# ========== API ENDPOINTS ==========

@app.route('/', methods=['GET'])
def home():
    """Home endpoint - API info"""
    return jsonify({
        'message': 'Manufacturing Data API',
        'version': '1.0',
        'endpoints': {
            'GET /': 'API information',
            'GET /api/search/<pcb_sr_no>': 'Search by PCB Serial Number',
            'POST /api/search': 'Search by PCB Serial Number (POST)',
            'GET /api/all': 'Get all records (paginated)',
            'GET /api/stats': 'Get database statistics',
            'GET /api/search-by-lot/<lot_no>': 'Search by Lot Number',
            'GET /api/search-by-model/<model>': 'Search by Model'
        }
    }), 200

@app.route('/api/search/<pcb_sr_no>', methods=['GET'])
def search_by_pcb_get(pcb_sr_no):
    """Search record by PCB Serial Number (GET method)"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        SELECT * FROM manufacturing_data 
        WHERE pcb_sr_no = %s
        """
        cursor.execute(query, (pcb_sr_no,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if result:
            # Convert datetime to string for JSON serialization
            if result.get('created_at'):
                result['created_at'] = result['created_at'].isoformat()
            
            return jsonify({
                'success': True,
                'data': result,
                'message': f'Record found for PCB Serial Number: {pcb_sr_no}'
            }), 200
        else:
            return jsonify({
                'success': False,
                'data': None,
                'message': f'No record found for PCB Serial Number: {pcb_sr_no}'
            }), 404
            
    except psycopg2.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/search', methods=['POST'])
def search_by_pcb_post():
    """Search record by PCB Serial Number (POST method)"""
    data = request.get_json()
    
    if not data or 'pcb_sr_no' not in data:
        return jsonify({
            'error': 'Missing pcb_sr_no in request body'
        }), 400
    
    pcb_sr_no = data['pcb_sr_no']
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        SELECT * FROM manufacturing_data 
        WHERE pcb_sr_no = %s
        """
        cursor.execute(query, (pcb_sr_no,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if result:
            if result.get('created_at'):
                result['created_at'] = result['created_at'].isoformat()
            
            return jsonify({
                'success': True,
                'data': result,
                'message': f'Record found for PCB Serial Number: {pcb_sr_no}'
            }), 200
        else:
            return jsonify({
                'success': False,
                'data': None,
                'message': f'No record found for PCB Serial Number: {pcb_sr_no}'
            }), 404
            
    except psycopg2.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/all', methods=['GET'])
def get_all_records():
    """Get all records with pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Limit per_page to prevent large queries
    per_page = min(per_page, 100)
    
    offset = (page - 1) * per_page
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get total count
        cursor.execute("SELECT COUNT(*) FROM manufacturing_data")
        total = cursor.fetchone()['count']
        
        # Get paginated results
        query = """
        SELECT * FROM manufacturing_data 
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s
        """
        cursor.execute(query, (per_page, offset))
        results = cursor.fetchall()
        
        # Convert datetime to string
        for result in results:
            if result.get('created_at'):
                result['created_at'] = result['created_at'].isoformat()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': results,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'total_pages': (total + per_page - 1) // per_page
            }
        }), 200
        
    except psycopg2.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get database statistics"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Total records
        cursor.execute("SELECT COUNT(*) as total FROM manufacturing_data")
        total = cursor.fetchone()['total']
        
        # Unique counts
        cursor.execute("""
            SELECT 
                COUNT(DISTINCT lot_no) as unique_lots,
                COUNT(DISTINCT model) as unique_models,
                COUNT(DISTINCT part_code) as unique_parts,
                COUNT(DISTINCT ticket_no) as unique_tickets
            FROM manufacturing_data
        """)
        stats = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_records': total,
                'unique_lot_numbers': stats['unique_lots'],
                'unique_models': stats['unique_models'],
                'unique_part_codes': stats['unique_parts'],
                'unique_tickets': stats['unique_tickets']
            }
        }), 200
        
    except psycopg2.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/search-by-lot/<lot_no>', methods=['GET'])
def search_by_lot(lot_no):
    """Search records by Lot Number"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        SELECT * FROM manufacturing_data 
        WHERE lot_no = %s
        ORDER BY created_at DESC
        """
        cursor.execute(query, (lot_no,))
        results = cursor.fetchall()
        
        # Convert datetime
        for result in results:
            if result.get('created_at'):
                result['created_at'] = result['created_at'].isoformat()
        
        cursor.close()
        conn.close()
        
        if results:
            return jsonify({
                'success': True,
                'data': results,
                'count': len(results),
                'message': f'Found {len(results)} records for Lot Number: {lot_no}'
            }), 200
        else:
            return jsonify({
                'success': False,
                'data': [],
                'count': 0,
                'message': f'No records found for Lot Number: {lot_no}'
            }), 404
            
    except psycopg2.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/search-by-model/<model>', methods=['GET'])
def search_by_model(model):
    """Search records by Model"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        SELECT * FROM manufacturing_data 
        WHERE model = %s
        ORDER BY created_at DESC
        """
        cursor.execute(query, (model,))
        results = cursor.fetchall()
        
        # Convert datetime
        for result in results:
            if result.get('created_at'):
                result['created_at'] = result['created_at'].isoformat()
        
        cursor.close()
        conn.close()
        
        if results:
            return jsonify({
                'success': True,
                'data': results,
                'count': len(results),
                'message': f'Found {len(results)} records for Model: {model}'
            }), 200
        else:
            return jsonify({
                'success': False,
                'data': [],
                'count': 0,
                'message': f'No records found for Model: {model}'
            }), 404
            
    except psycopg2.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# ========== ERROR HANDLERS ==========

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ========== RUN SERVER ==========

if __name__ == '__main__':
    print("="*70)
    print("🚀 Manufacturing Data API Server")
    print("="*70)
    print(f"📍 Server running at: http://localhost:5000")
    print(f"📖 API Documentation: http://localhost:5000/")
    print("\n📋 Available Endpoints:")
    print("  • GET  /api/search/<pcb_sr_no>")
    print("  • POST /api/search")
    print("  • GET  /api/all")
    print("  • GET  /api/stats")
    print("  • GET  /api/search-by-lot/<lot_no>")
    print("  • GET  /api/search-by-model/<model>")
    print("="*70)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
